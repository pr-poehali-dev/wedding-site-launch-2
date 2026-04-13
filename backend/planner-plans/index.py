import json
import os
import secrets
import psycopg2
from datetime import datetime

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user(cur, session_id):
    if not session_id:
        return None
    cur.execute(
        "SELECT u.id, u.name FROM planner_sessions s JOIN planner_users u ON u.id = s.user_id WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """CRUD для планов рассадки: список, создание, чтение, обновление, удаление"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    params = event.get("queryStringParameters") or {}
    action = body.get("action") or params.get("action") or ""
    session_id = (event.get("headers") or {}).get("X-Session-Id", "")

    conn = get_conn()
    cur = conn.cursor()

    # Получить план по guest_token (публичный доступ)
    if action == "by_token":
        token = body.get("token") or params.get("token", "")
        cur.execute("SELECT id, title, event_date, hall_width, hall_height FROM seating_plans WHERE guest_token = %s", (token,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "План не найден"})}
        plan = {"id": row[0], "title": row[1], "event_date": str(row[2]) if row[2] else None, "hall_width": row[3], "hall_height": row[4]}
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(plan)}

    # Список планов пользователя
    if action == "list":
        user = get_user(cur, session_id)
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        cur.execute(
            "SELECT id, title, event_date, hall_width, hall_height, guest_token, created_at, updated_at FROM seating_plans WHERE user_id = %s ORDER BY updated_at DESC",
            (user[0],)
        )
        rows = cur.fetchall()
        plans = [{"id": r[0], "title": r[1], "event_date": str(r[2]) if r[2] else None, "hall_width": r[3], "hall_height": r[4], "guest_token": r[5], "created_at": str(r[6]), "updated_at": str(r[7])} for r in rows]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"plans": plans})}

    # Создать план
    if action == "create":
        user = get_user(cur, session_id)
        title = body.get("title", "Мой план рассадки")
        event_date = body.get("event_date") or None
        hall_w = body.get("hall_width", 1200)
        hall_h = body.get("hall_height", 800)
        token = secrets.token_hex(16)
        user_id = user[0] if user else None
        cur.execute(
            "INSERT INTO seating_plans (user_id, title, event_date, hall_width, hall_height, guest_token) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, guest_token",
            (user_id, title, event_date, hall_w, hall_h, token)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": row[0], "guest_token": row[1]})}

    # Получить полный план с таблицами и гостями
    if action == "get":
        plan_id = int(body.get("plan_id") or params.get("plan_id", 0))
        user = get_user(cur, session_id)
        cur.execute("SELECT id, title, event_date, hall_width, hall_height, guest_token, user_id FROM seating_plans WHERE id = %s", (plan_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найден"})}
        if row[6] is not None and (not user or user[0] != row[6]):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        plan = {"id": row[0], "title": row[1], "event_date": str(row[2]) if row[2] else None, "hall_width": row[3], "hall_height": row[4], "guest_token": row[5]}
        cur.execute("SELECT id, label, shape, x, y, width, height, seats, color, rotation FROM seating_tables WHERE plan_id = %s", (plan_id,))
        plan["tables"] = [{"id": r[0], "label": r[1], "shape": r[2], "x": r[3], "y": r[4], "width": r[5], "height": r[6], "seats": r[7], "color": r[8], "rotation": r[9]} for r in cur.fetchall()]
        cur.execute("SELECT id, name, table_id, seat_number, phone, note, rsvp_status FROM seating_guests WHERE plan_id = %s ORDER BY name", (plan_id,))
        plan["guests"] = [{"id": r[0], "name": r[1], "table_id": r[2], "seat_number": r[3], "phone": r[4], "note": r[5], "rsvp_status": r[6]} for r in cur.fetchall()]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(plan)}

    # Обновить план (мета + таблицы)
    if action == "update":
        plan_id = int(body.get("plan_id", 0))
        user = get_user(cur, session_id)
        cur.execute("SELECT user_id FROM seating_plans WHERE id = %s", (plan_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найден"})}
        if row[0] is not None and (not user or user[0] != row[0]):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        fields = []
        vals = []
        for f in ["title", "event_date", "hall_width", "hall_height"]:
            if f in body:
                fields.append(f"{f} = %s")
                vals.append(body[f])
        fields.append("updated_at = NOW()")
        vals.append(plan_id)
        cur.execute(f"UPDATE seating_plans SET {', '.join(fields)} WHERE id = %s", vals)

        if "tables" in body:
            cur.execute("SELECT id FROM seating_tables WHERE plan_id = %s", (plan_id,))
            existing_ids = {r[0] for r in cur.fetchall()}
            incoming_ids = set()
            for t in body["tables"]:
                if t.get("id") and t["id"] in existing_ids:
                    cur.execute(
                        "UPDATE seating_tables SET label=%s, shape=%s, x=%s, y=%s, width=%s, height=%s, seats=%s, color=%s, rotation=%s WHERE id=%s",
                        (t.get("label",""), t.get("shape","round"), t.get("x",100), t.get("y",100), t.get("width",120), t.get("height",120), t.get("seats",8), t.get("color","#c9a96e"), t.get("rotation",0), t["id"])
                    )
                    incoming_ids.add(t["id"])
                else:
                    cur.execute(
                        "INSERT INTO seating_tables (plan_id, label, shape, x, y, width, height, seats, color, rotation) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                        (plan_id, t.get("label",""), t.get("shape","round"), t.get("x",100), t.get("y",100), t.get("width",120), t.get("height",120), t.get("seats",8), t.get("color","#c9a96e"), t.get("rotation",0))
                    )
                    incoming_ids.add(cur.fetchone()[0])
            for old_id in existing_ids - incoming_ids:
                cur.execute("UPDATE seating_guests SET table_id = NULL WHERE table_id = %s", (old_id,))
                cur.execute("UPDATE seating_tables SET plan_id = -1 WHERE id = %s", (old_id,))

        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите action: list | create | get | update | by_token"})}
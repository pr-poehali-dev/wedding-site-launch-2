import json
import os
import psycopg2

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
        "SELECT u.id FROM planner_sessions s JOIN planner_users u ON u.id = s.user_id WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    return row[0] if row else None

def check_plan_access(cur, plan_id, user_id):
    cur.execute("SELECT user_id FROM seating_plans WHERE id = %s", (plan_id,))
    row = cur.fetchone()
    if not row:
        return False
    if row[0] is None:
        return True
    return row[0] == user_id

def handler(event: dict, context) -> dict:
    """CRUD для гостей: добавление, редактирование, удаление, рассадка"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "")
    session_id = (event.get("headers") or {}).get("X-Session-Id", "")

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, session_id)

    # Добавить гостя
    if action == "add":
        plan_id = body.get("plan_id")
        if not check_plan_access(cur, plan_id, user_id):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        cur.execute(
            "INSERT INTO seating_guests (plan_id, name, phone, note) VALUES (%s, %s, %s, %s) RETURNING id",
            (plan_id, body.get("name",""), body.get("phone",""), body.get("note",""))
        )
        guest_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": guest_id})}

    # Добавить несколько гостей сразу
    if action == "bulk":
        plan_id = body.get("plan_id")
        if not check_plan_access(cur, plan_id, user_id):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        guests = body.get("guests", [])
        ids = []
        for g in guests:
            cur.execute(
                "INSERT INTO seating_guests (plan_id, name, phone, note) VALUES (%s, %s, %s, %s) RETURNING id",
                (plan_id, g.get("name",""), g.get("phone",""), g.get("note",""))
            )
            ids.append(cur.fetchone()[0])
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ids": ids})}

    # Обновить гостя
    if action == "update":
        guest_id = int(body.get("guest_id", 0))
        cur.execute("SELECT plan_id FROM seating_guests WHERE id = %s", (guest_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Гость не найден"})}
        if not check_plan_access(cur, row[0], user_id):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        fields = []
        vals = []
        for f in ["name", "phone", "note", "table_id", "seat_number", "rsvp_status"]:
            if f in body:
                fields.append(f"{f} = %s")
                vals.append(body[f])
        if fields:
            vals.append(guest_id)
            cur.execute(f"UPDATE seating_guests SET {', '.join(fields)} WHERE id = %s", vals)
            conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # Рассадить гостя за стол
    if action == "seat":
        guest_id = body.get("guest_id")
        table_id = body.get("table_id")
        seat_number = body.get("seat_number")
        cur.execute("SELECT plan_id FROM seating_guests WHERE id = %s", (guest_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Гость не найден"})}
        if not check_plan_access(cur, row[0], user_id):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        cur.execute("UPDATE seating_guests SET table_id = %s, seat_number = %s WHERE id = %s", (table_id, seat_number, guest_id))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # Удалить гостя
    if action == "remove":
        guest_id = int(body.get("guest_id", 0))
        cur.execute("SELECT plan_id FROM seating_guests WHERE id = %s", (guest_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найден"})}
        if not check_plan_access(cur, row[0], user_id):
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        cur.execute("UPDATE seating_guests SET table_id = NULL, seat_number = NULL, plan_id = -1 WHERE id = %s", (guest_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите action: add | bulk | update | seat | remove"})}
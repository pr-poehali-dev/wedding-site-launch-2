import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Авторизация планировщика: регистрация, вход, выход, проверка сессии"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    params = event.get("queryStringParameters") or {}
    action = body.get("action") or params.get("action") or ""
    session_id = (event.get("headers") or {}).get("X-Session-Id", "")

    conn = get_conn()
    cur = conn.cursor()

    # Регистрация
    if action == "register":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        name = body.get("name", "").strip()
        if not email or not password or not name:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
        cur.execute("SELECT id FROM planner_users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email уже зарегистрирован"})}
        cur.execute(
            "INSERT INTO planner_users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, name, email",
            (email, hash_password(password), name)
        )
        user = cur.fetchone()
        sid = secrets.token_hex(32)
        expires = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO planner_sessions (id, user_id, expires_at) VALUES (%s, %s, %s)",
            (sid, user[0], expires)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "session_id": sid, "user": {"id": user[0], "name": user[1], "email": user[2]}
        })}

    # Вход
    if action == "login":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        cur.execute(
            "SELECT id, name, email FROM planner_users WHERE email = %s AND password_hash = %s",
            (email, hash_password(password))
        )
        user = cur.fetchone()
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}
        sid = secrets.token_hex(32)
        expires = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO planner_sessions (id, user_id, expires_at) VALUES (%s, %s, %s)",
            (sid, user[0], expires)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "session_id": sid, "user": {"id": user[0], "name": user[1], "email": user[2]}
        })}

    # Проверка сессии
    if action == "me":
        if not session_id:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        cur.execute(
            "SELECT u.id, u.name, u.email FROM planner_sessions s JOIN planner_users u ON u.id = s.user_id WHERE s.id = %s AND s.expires_at > NOW()",
            (session_id,)
        )
        user = cur.fetchone()
        conn.close()
        if not user:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "user": {"id": user[0], "name": user[1], "email": user[2]}
        })}

    # Выход
    if action == "logout":
        if session_id:
            cur.execute("UPDATE planner_sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
            conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите action: register | login | logout | me"})}
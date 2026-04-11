import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def format_price(amount: int) -> str:
    """Форматирует цену в рубли."""
    parts = []
    s = str(int(amount))
    while len(s) > 3:
        parts.append(s[-3:])
        s = s[:-3]
    parts.append(s)
    return " ".join(reversed(parts)) + " ₽"


def build_html(email: str, guests: int, items: list, total_econom: int, total_premium: int) -> str:
    rows_html = ""
    for item in items:
        icon = item.get("icon", "")
        name = item.get("name", "")
        econom = item.get("econom", 0)
        premium = item.get("premium", 0)
        rows_html += f"""
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #2a2218;color:#e8d9b5;font-size:14px;">
            {icon} {name}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #2a2218;color:#c9a84c;font-size:14px;text-align:right;white-space:nowrap;">
            {format_price(econom) if econom else "—"}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #2a2218;color:#f0c96a;font-size:14px;text-align:right;white-space:nowrap;">
            {format_price(premium) if premium else "—"}
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0d0b08;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b08;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#13100c;border:1px solid #3a2f1a;">

  <tr><td align="center" style="padding:36px 32px 28px;background:linear-gradient(160deg,#1a1408,#0d0b08);border-bottom:1px solid #3a2f1a;">
    <div style="color:#c9a84c;font-size:12px;letter-spacing:6px;margin-bottom:12px;">✦ &nbsp; ✦ &nbsp; ✦</div>
    <h1 style="margin:0 0 6px;color:#f0c96a;font-size:24px;font-weight:normal;letter-spacing:2px;">La Belle Époque</h1>
    <p style="margin:0;color:#9c8050;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Смета свадебного торжества</p>
    <div style="color:#c9a84c;font-size:12px;letter-spacing:6px;margin-top:12px;">✦ &nbsp; ✦ &nbsp; ✦</div>
  </td></tr>

  <tr><td style="padding:20px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#9c8050;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Получатель</td>
        <td align="right" style="color:#9c8050;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Гостей</td>
      </tr>
      <tr>
        <td style="color:#e8d9b5;font-size:14px;padding-top:4px;">{email}</td>
        <td align="right" style="color:#e8d9b5;font-size:14px;padding-top:4px;">{guests} чел.</td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid #2a2218;margin:16px 0 0;"/>
  </td></tr>

  <tr><td style="padding:0 32px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr style="background:#1a1408;">
          <th style="padding:10px 16px;text-align:left;color:#9c8050;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:normal;border-bottom:1px solid #3a2f1a;">Услуга</th>
          <th style="padding:10px 16px;text-align:right;color:#9c8050;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:normal;border-bottom:1px solid #3a2f1a;">Эконом</th>
          <th style="padding:10px 16px;text-align:right;color:#9c8050;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:normal;border-bottom:1px solid #3a2f1a;">Премиум</th>
        </tr>
      </thead>
      <tbody>{rows_html}</tbody>
      <tfoot>
        <tr style="background:#1a1408;">
          <td style="padding:14px 16px;color:#f0c96a;font-size:15px;font-weight:bold;border-top:1px solid #3a2f1a;">Итого</td>
          <td style="padding:14px 16px;text-align:right;color:#c9a84c;font-size:16px;font-weight:bold;border-top:1px solid #3a2f1a;white-space:nowrap;">{format_price(total_econom) if total_econom else "—"}</td>
          <td style="padding:14px 16px;text-align:right;color:#f0c96a;font-size:16px;font-weight:bold;border-top:1px solid #3a2f1a;white-space:nowrap;">{format_price(total_premium) if total_premium else "—"}</td>
        </tr>
      </tfoot>
    </table>
  </td></tr>

  <tr><td style="padding:14px 32px 0;">
    <p style="margin:0;color:#6b5a3a;font-size:11px;font-style:italic;line-height:1.6;border-left:2px solid #3a2f1a;padding-left:10px;">
      Смета носит ориентировочный характер и уточняется при личной встрече.
    </p>
  </td></tr>

  <tr><td align="center" style="padding:24px 32px 28px;border-top:1px solid #2a2218;margin-top:20px;">
    <div style="color:#3a2f1a;font-size:12px;letter-spacing:6px;margin-bottom:10px;">✦ &nbsp; ✦ &nbsp; ✦</div>
    <p style="margin:0 0 4px;color:#9c8050;font-size:11px;letter-spacing:3px;text-transform:uppercase;">La Belle Époque</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def handler(event: dict, context) -> dict:
    """Отправляет смету свадебного торжества на email клиента."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        email = body.get("email", "").strip()
        guests = int(body.get("guests", 0))
        items = body.get("items", [])
        total_econom = int(body.get("totalEconom", 0))
        total_premium = int(body.get("totalPremium", 0))

        if not email:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "email обязателен"})}

        html_body = build_html(email, guests, items, total_econom, total_premium)

        smtp_user = os.environ["SMTP_USER"]
        smtp_password = os.environ["SMTP_PASSWORD"]

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "La Belle Époque — Смета свадебного торжества"
        msg["From"] = f"La Belle Époque <{smtp_user}>"
        msg["To"] = email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [email], msg.as_string())

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}

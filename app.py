"""
Ebenezer Baptist Church — single-page site.

Two routes:
  GET  /         renders the page
  POST /contact   sends the contact form as an email via Gmail SMTP

Required environment variables (set these in Vercel, never commit them):
  GMAIL_ADDRESS        the Gmail address the form sends FROM
  GMAIL_APP_PASSWORD   a Gmail App Password for that address (not your login password)
  CHURCH_CONTACT_EMAIL the address messages should be delivered TO
                        (defaults to GMAIL_ADDRESS if not set)

See README.md for how to generate a Gmail App Password.
"""
import os
import re
import smtplib
from email.mime.text import MIMEText

from flask import Flask, render_template, request, jsonify

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    data = request.form

    # Honeypot: a hidden field real visitors never see or fill in.
    # If it's non-empty, silently pretend success and drop the message.
    if data.get("company"):
        return jsonify({"ok": True})

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "Please fill in every field."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"ok": False, "error": "That email address doesn't look right."}), 400

    try:
        send_notification(name, email, message)
    except Exception:
        app.logger.exception("Failed to send contact form email")
        return jsonify({
            "ok": False,
            "error": "Something went wrong sending your message. Please try again shortly.",
        }), 502

    return jsonify({"ok": True})


def send_notification(name: str, email: str, message: str) -> None:
    sender = os.environ["GMAIL_ADDRESS"]
    recipient = os.environ.get("CHURCH_CONTACT_EMAIL", sender)

    body = f"From: {name} <{email}>\n\n{message}\n\n---\nSent from the visiteb.church contact form."
    msg = MIMEText(body)
    msg["Subject"] = f"New message from {name} — church website"
    msg["From"] = sender
    msg["To"] = recipient
    msg["Reply-To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, os.environ["GMAIL_APP_PASSWORD"])
        server.send_message(msg)


# Local dev only. On Vercel this file is imported as a WSGI app and .run()
# is never called — Vercel's Flask runtime serves the `app` object directly.
if __name__ == "__main__":
    app.run(debug=True, port=5000)

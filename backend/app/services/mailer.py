import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

log = logging.getLogger("portfolio.mailer")


def send_contact_notification(name: str, email: str, subject: str, message: str) -> None:
    """Runs in a background task; failures are logged, never shown to the visitor."""
    if not (settings.SMTP_HOST and settings.CONTACT_NOTIFY_TO):
        return
    try:
        msg = EmailMessage()
        clean_subject = subject.replace("\r", " ").replace("\n", " ")
        msg["Subject"] = f"[Portfolio] {clean_subject}"
        msg["From"] = settings.SMTP_USER or settings.CONTACT_NOTIFY_TO
        msg["To"] = settings.CONTACT_NOTIFY_TO
        msg["Reply-To"] = email
        msg.set_content(f"From: {name} <{email}>\n\n{message}")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            smtp.starttls()
            if settings.SMTP_USER:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
    except Exception:  # noqa: BLE001
        log.exception("Could not send contact notification email")

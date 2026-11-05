import os
import secrets
import warnings
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _flag(name: str, default: str = "true") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'portfolio.db'}"

        key = os.getenv("SECRET_KEY", "")
        if len(key) < 32:
            warnings.warn(
                "SECRET_KEY is missing or shorter than 32 characters; using a temporary random key. "
                "Admin logins will be invalidated on every restart. Set SECRET_KEY in .env.",
                stacklevel=2,
            )
            key = secrets.token_urlsafe(48)
        self.SECRET_KEY = key

        origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
        self.ALLOWED_ORIGINS = [o.strip().rstrip("/") for o in origins.split(",") if o.strip()]
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

        upload = Path(os.getenv("UPLOAD_DIR", "uploads"))
        self.UPLOAD_DIR = upload if upload.is_absolute() else BASE_DIR / upload
        self.MAX_UPLOAD_BYTES = int(float(os.getenv("MAX_UPLOAD_MB", "5")) * 1024 * 1024)
        self.ENABLE_DOCS = _flag("ENABLE_DOCS")

        self.SMTP_HOST = os.getenv("SMTP_HOST", "")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        self.SMTP_USER = os.getenv("SMTP_USER", "")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.CONTACT_NOTIFY_TO = os.getenv("CONTACT_NOTIFY_TO", "")


settings = Settings()

"""Create the admin account (or reset its password).

    python -m scripts.create_admin

Or non-interactively: ADMIN_USERNAME=tek ADMIN_PASSWORD='long-password' python -m scripts.create_admin
"""
import getpass
import os
import sys

from sqlalchemy import select

from app import models  # noqa: F401
from app.auth.security import hash_password
from app.database.session import Base, SessionLocal, engine
from app.models import User


def main() -> None:
    Base.metadata.create_all(bind=engine)
    username = (os.getenv("ADMIN_USERNAME") or input("Admin username: ")).strip()
    password = os.getenv("ADMIN_PASSWORD") or getpass.getpass("Admin password (min 10 characters): ")
    if not username:
        sys.exit("Username cannot be empty.")
    if len(password) < 10:
        sys.exit("Password must be at least 10 characters.")

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == username))
        if user:
            user.hashed_password = hash_password(password)
            user.is_admin = True
            print(f"Updated password for '{username}'.")
        else:
            db.add(User(username=username, hashed_password=hash_password(password), is_admin=True))
            print(f"Created admin '{username}'.")
        db.commit()


if __name__ == "__main__":
    main()

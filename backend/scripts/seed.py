"""Load the placeholder sample content (same files the static frontend uses) into the database.

    python -m scripts.seed

Safe to re-run: a table that already has rows is skipped.
"""
import json
import re
from pathlib import Path

from sqlalchemy import func, select

from app import models  # noqa: F401
from app.database.session import Base, SessionLocal, engine
from app.models import Certification, Education, Experience, Note, Photo, Profile, Project, Skill
from app.services.content import apply_note, apply_photo, apply_project, save_object

DATA_DIR = Path(__file__).resolve().parents[2] / "frontend" / "src" / "data"
_BRACKETS = re.compile(r"\[[^\]]*\]")

RESOURCES = [
    ("projects.json", Project, apply_project),
    ("notes.json", Note, apply_note),
    ("photos.json", Photo, apply_photo),
    ("certifications.json", Certification, None),
    ("experience.json", Experience, None),
    ("education.json", Education, None),
    ("skills.json", Skill, None),
]


def clean(item: dict) -> dict:
    out = {}
    for key, value in item.items():
        if key == "id":
            continue
        if isinstance(value, str) and _BRACKETS.fullmatch(value.strip()):
            value = ""  # whole-bracket placeholders like "[YOUR EMAIL]" become empty fields
        out[key] = value
    return out


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Profile)) == 0:
            data = json.loads((DATA_DIR / "profile.json").read_text(encoding="utf-8"))
            save_object(db, Profile, clean(data))
            print("Seeded profile")
        for filename, Model, apply in RESOURCES:
            if db.scalar(select(func.count()).select_from(Model)):
                print(f"Skipped {filename} (table not empty)")
                continue
            items = json.loads((DATA_DIR / filename).read_text(encoding="utf-8"))
            for item in items:
                save_object(db, Model, clean(item), apply)
            print(f"Seeded {len(items)} rows from {filename}")


if __name__ == "__main__":
    main()

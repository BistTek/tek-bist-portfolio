from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, NoteCategory, Photo, PhotoCategory, Profile, ProjectImage, Tag
from app.services.text import camel_to_snake, reading_time

_PROTECTED = {"id", "created_at", "hashed_password", "user_id"}


def _clean_tags(raw) -> list[str]:
    seen: list[str] = []
    for t in raw or []:
        t = str(t).strip().lower()[:50]
        if t and t not in seen:
            seen.append(t)
    return seen[:20]


def _get_or_create(db: Session, model, name: str):
    return db.scalar(select(model).where(model.name == name)) or model(name=name)


def apply_project(db: Session, obj, data: dict) -> None:
    if "screenshots" in data:
        obj.images = [ProjectImage(url=u) for u in data["screenshots"] if u]


def apply_note(db: Session, obj, data: dict) -> None:
    if "category" in data or obj.category is None:
        name = (data.get("category") or "General").strip()[:80] or "General"
        obj.category = _get_or_create(db, NoteCategory, name)
    if "tags" in data:
        obj.tags = [_get_or_create(db, Tag, t) for t in _clean_tags(data["tags"])]
    if "content" in data or not obj.reading_time:
        obj.reading_time = reading_time(obj.content or "")
    if not obj.date:
        obj.date = date.today().isoformat()
    if not obj.author:
        profile = db.scalar(select(Profile))
        obj.author = profile.name if profile and profile.name else "Admin"


def apply_photo(db: Session, obj, data: dict) -> None:
    if "category" in data or obj.category is None:
        name = (data.get("category") or "General").strip()[:80] or "General"
        obj.category = _get_or_create(db, PhotoCategory, name)
    if "tags" in data:
        obj.tags = _clean_tags(data["tags"])
    if not obj.date:
        obj.date = date.today().isoformat()


def save_object(db: Session, Model, data: dict, apply=None, obj=None):
    """Create or update a row from camelCase data. Unknown keys are ignored; relations go through `apply`."""
    creating = obj is None
    if creating:
        obj = Model()
    columns = set(Model.__table__.columns.keys())
    for key, value in data.items():
        col = camel_to_snake(key)
        if col in columns and col not in _PROTECTED and not col.endswith("_id"):
            setattr(obj, col, value)
    if apply:
        apply(db, obj, data)
    if creating:
        db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

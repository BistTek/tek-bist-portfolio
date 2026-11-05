from datetime import datetime, timezone
from typing import ClassVar, Optional

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.services.text import snake_to_camel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Serializable:
    """to_dict() returns camelCase keys so API responses match the frontend data shape."""

    hidden: ClassVar[tuple] = ()

    def extra(self) -> dict:
        return {}

    def to_dict(self) -> dict:
        out = {}
        for col in self.__table__.columns:  # type: ignore[attr-defined]
            if col.name in self.hidden:
                continue
            value = getattr(self, col.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            out[snake_to_camel(col.name)] = value
        out.update(self.extra())
        return out


class User(Serializable, Base):
    __tablename__ = "users"
    hidden = ("hashed_password",)

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=True)
    profile: Mapped[Optional["Profile"]] = relationship(back_populates="user", uselist=False)


class Profile(Serializable, Base):
    __tablename__ = "profiles"
    hidden = ("user_id",)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    title: Mapped[str] = mapped_column(String(120), default="")
    tagline: Mapped[str] = mapped_column(Text, default="")
    short_bio: Mapped[str] = mapped_column(Text, default="")
    career_interests: Mapped[str] = mapped_column(Text, default="")
    technical_interests: Mapped[str] = mapped_column(Text, default="")
    goals: Mapped[str] = mapped_column(Text, default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(50), default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    github: Mapped[str] = mapped_column(String(500), default="")
    linkedin: Mapped[str] = mapped_column(String(500), default="")
    facebook: Mapped[str] = mapped_column(String(500), default="")
    instagram: Mapped[str] = mapped_column(String(500), default="")
    x: Mapped[str] = mapped_column(String(500), default="")
    cv_file: Mapped[str] = mapped_column(String(500), default="")
    profile_photo: Mapped[str] = mapped_column(String(500), default="")
    user: Mapped[Optional["User"]] = relationship(back_populates="profile")


class Skill(Serializable, Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    items: Mapped[list] = mapped_column(JSON, default=list)


class Project(Serializable, Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50), default="Web")
    year: Mapped[str] = mapped_column(String(10), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    problem: Mapped[str] = mapped_column(Text, default="")
    overview: Mapped[str] = mapped_column(Text, default="")
    objectives: Mapped[list] = mapped_column(JSON, default=list)
    features: Mapped[list] = mapped_column(JSON, default=list)
    tech: Mapped[list] = mapped_column(JSON, default=list)
    architecture: Mapped[str] = mapped_column(Text, default="")
    challenges: Mapped[str] = mapped_column(Text, default="")
    solutions: Mapped[str] = mapped_column(Text, default="")
    results: Mapped[str] = mapped_column(Text, default="")
    future_improvements: Mapped[list] = mapped_column(JSON, default=list)
    github: Mapped[str] = mapped_column(String(500), default="")
    demo: Mapped[str] = mapped_column(String(500), default="")
    image: Mapped[str] = mapped_column(String(500), default="")
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    images: Mapped[list["ProjectImage"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", lazy="selectin", order_by="ProjectImage.id"
    )

    def extra(self) -> dict:
        return {"screenshots": [i.url for i in self.images]}


class ProjectImage(Serializable, Base):
    __tablename__ = "project_images"
    hidden = ("project_id",)

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str] = mapped_column(String(255), default="")
    project: Mapped["Project"] = relationship(back_populates="images")


class Experience(Serializable, Base):
    __tablename__ = "experience"

    id: Mapped[int] = mapped_column(primary_key=True)
    company: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(50), default="Full-time")
    start: Mapped[str] = mapped_column(String(20), default="")
    end: Mapped[str] = mapped_column(String(20), default="")
    location: Mapped[str] = mapped_column(String(200), default="")
    responsibilities: Mapped[list] = mapped_column(JSON, default=list)
    tech: Mapped[list] = mapped_column(JSON, default=list)
    achievements: Mapped[list] = mapped_column(JSON, default=list)


class Education(Serializable, Base):
    __tablename__ = "education"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution: Mapped[str] = mapped_column(String(200))
    degree: Mapped[str] = mapped_column(String(200))
    start: Mapped[str] = mapped_column(String(20), default="")
    end: Mapped[str] = mapped_column(String(20), default="")
    description: Mapped[str] = mapped_column(Text, default="")


class Certification(Serializable, Base):
    __tablename__ = "certifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    issuer: Mapped[str] = mapped_column(String(200), default="")
    date: Mapped[str] = mapped_column(String(20), default="")
    category: Mapped[str] = mapped_column(String(80), default="General")
    credential_id: Mapped[str] = mapped_column(String(200), default="")
    verify_url: Mapped[str] = mapped_column(String(500), default="")
    image: Mapped[str] = mapped_column(String(500), default="")


class PhotoCategory(Base):
    __tablename__ = "photo_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)


class Photo(Serializable, Base):
    __tablename__ = "photos"
    hidden = ("category_id",)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(20), default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    src: Mapped[str] = mapped_column(String(500), default="")
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("photo_categories.id"), nullable=True)
    category: Mapped[Optional["PhotoCategory"]] = relationship(lazy="joined")

    def extra(self) -> dict:
        return {"category": self.category.name if self.category else ""}


class NoteCategory(Base):
    __tablename__ = "note_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)


note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Note(Serializable, Base):
    __tablename__ = "notes"
    hidden = ("category_id",)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(20), default="")
    reading_time: Mapped[str] = mapped_column(String(20), default="")
    featured_image: Mapped[str] = mapped_column(String(500), default="")
    author: Mapped[str] = mapped_column(String(120), default="")
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("note_categories.id"), nullable=True)
    category: Mapped[Optional["NoteCategory"]] = relationship(lazy="joined")
    tags: Mapped[list["Tag"]] = relationship(secondary=note_tags, lazy="selectin")

    def extra(self) -> dict:
        return {
            "category": self.category.name if self.category else "",
            "tags": sorted(t.name for t in self.tags),
        }


class ContactMessage(Serializable, Base):
    __tablename__ = "contact_messages"
    hidden = ("ip",)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    ip: Mapped[str] = mapped_column(String(64), default="")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

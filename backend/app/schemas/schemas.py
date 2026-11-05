import re
from typing import Annotated, List

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field

_URL_RE = re.compile(r"^(https?://|mailto:|/)", re.I)
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _safe_url(v: str) -> str:
    v = v.strip()
    if not v:
        return v
    if not _URL_RE.match(v) or v[:2] in ("//", "/\\"):
        raise ValueError("must be empty or start with http://, https://, mailto: or a single /")
    return v


def _email_or_empty(v: str) -> str:
    v = v.strip()
    if v and not _EMAIL_RE.match(v):
        raise ValueError("must be a valid email address")
    return v


SafeUrl = Annotated[str, Field(max_length=500), AfterValidator(_safe_url)]
OptEmail = Annotated[str, Field(max_length=255), AfterValidator(_email_or_empty)]
Short = Annotated[str, Field(max_length=255)]
Long = Annotated[str, Field(max_length=20000)]
ShortList = Annotated[List[Short], Field(max_length=60)]


class _In(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class ProjectIn(_In):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    category: Annotated[str, Field(max_length=50)] = "Web"
    year: Annotated[str, Field(max_length=10)] = ""
    description: Long = ""
    problem: Long = ""
    overview: Long = ""
    objectives: ShortList = []
    features: ShortList = []
    tech: ShortList = []
    architecture: Long = ""
    challenges: Long = ""
    solutions: Long = ""
    results: Long = ""
    futureImprovements: ShortList = []
    github: SafeUrl = ""
    demo: SafeUrl = ""
    image: SafeUrl = ""
    screenshots: Annotated[List[SafeUrl], Field(max_length=30)] = []
    published: bool = True


class NoteIn(_In):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    content: Annotated[str, Field(max_length=200_000)] = ""
    category: Annotated[str, Field(max_length=80)] = "General"
    tags: Annotated[List[Annotated[str, Field(max_length=50)]], Field(max_length=20)] = []
    featuredImage: SafeUrl = ""
    author: Annotated[str, Field(max_length=120)] = ""
    date: Annotated[str, Field(max_length=20)] = ""
    published: bool = True


class PhotoIn(_In):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    description: Long = ""
    category: Annotated[str, Field(max_length=80)] = "General"
    date: Annotated[str, Field(max_length=20)] = ""
    tags: Annotated[List[Annotated[str, Field(max_length=50)]], Field(max_length=20)] = []
    src: SafeUrl = ""


class CertificationIn(_In):
    name: Annotated[str, Field(min_length=1, max_length=200)]
    issuer: Short = ""
    date: Annotated[str, Field(max_length=20)] = ""
    category: Annotated[str, Field(max_length=80)] = "General"
    credentialId: Short = ""
    verifyUrl: SafeUrl = ""
    image: SafeUrl = ""


class ExperienceIn(_In):
    company: Annotated[str, Field(min_length=1, max_length=200)]
    title: Annotated[str, Field(min_length=1, max_length=200)]
    type: Annotated[str, Field(max_length=50)] = "Full-time"
    start: Annotated[str, Field(max_length=20)] = ""
    end: Annotated[str, Field(max_length=20)] = ""
    location: Short = ""
    responsibilities: ShortList = []
    tech: ShortList = []
    achievements: ShortList = []


class EducationIn(_In):
    institution: Annotated[str, Field(min_length=1, max_length=200)]
    degree: Annotated[str, Field(min_length=1, max_length=200)]
    start: Annotated[str, Field(max_length=20)] = ""
    end: Annotated[str, Field(max_length=20)] = ""
    description: Long = ""


class SkillIn(_In):
    category: Annotated[str, Field(min_length=1, max_length=100)]
    items: ShortList = []


class ProfileIn(_In):
    name: Annotated[str, Field(max_length=120)] = ""
    title: Annotated[str, Field(max_length=120)] = ""
    tagline: Long = ""
    shortBio: Long = ""
    careerInterests: Long = ""
    technicalInterests: Long = ""
    goals: Long = ""
    email: OptEmail = ""
    phone: Annotated[str, Field(max_length=50)] = ""
    location: Annotated[str, Field(max_length=120)] = ""
    github: SafeUrl = ""
    linkedin: SafeUrl = ""
    facebook: SafeUrl = ""
    instagram: SafeUrl = ""
    x: SafeUrl = ""
    cvFile: SafeUrl = ""
    profilePhoto: SafeUrl = ""


class ContactIn(_In):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    email: EmailStr
    subject: Annotated[str, Field(min_length=1, max_length=200)]
    message: Annotated[str, Field(min_length=10, max_length=5000)]
    website: Annotated[str, Field(max_length=200)] = ""  # honeypot, real visitors leave it empty


class LoginIn(_In):
    username: Annotated[str, Field(min_length=1, max_length=64)]
    password: Annotated[str, Field(min_length=1, max_length=256)]

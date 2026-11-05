from fastapi import APIRouter

from app.api.crud import make_crud_router
from app.models import Certification, Education, Experience, Note, Photo, Project, Skill
from app.schemas.schemas import (
    CertificationIn,
    EducationIn,
    ExperienceIn,
    NoteIn,
    PhotoIn,
    ProjectIn,
    SkillIn,
)
from app.services.content import apply_note, apply_photo, apply_project

router = APIRouter()

router.include_router(make_crud_router(
    "/projects", "Projects", Project, ProjectIn, [Project.year.desc(), Project.id.desc()],
    publishable=True, apply=apply_project, file_fields=("image", "screenshots"),
))
router.include_router(make_crud_router(
    "/notes", "Notes", Note, NoteIn, [Note.date.desc(), Note.id.desc()],
    publishable=True, apply=apply_note, file_fields=("featured_image",),
))
router.include_router(make_crud_router(
    "/photos", "Photos", Photo, PhotoIn, [Photo.date.desc(), Photo.id.desc()],
    apply=apply_photo, file_fields=("src",),
))
router.include_router(make_crud_router(
    "/certifications", "Certifications", Certification, CertificationIn, [Certification.date.desc(), Certification.id.desc()],
    file_fields=("image",),
))
router.include_router(make_crud_router(
    "/experience", "Experience", Experience, ExperienceIn, [Experience.start.desc(), Experience.id.desc()],
))
router.include_router(make_crud_router(
    "/education", "Education", Education, EducationIn, [Education.start.desc(), Education.id.desc()],
))
router.include_router(make_crud_router(
    "/skills", "Skills", Skill, SkillIn, [Skill.id.asc()],
))

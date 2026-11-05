from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database.session import get_db
from app.models import Profile
from app.schemas.schemas import ProfileIn
from app.services.content import save_object

router = APIRouter(tags=["Profile"])


@router.get("")
def get_profile(db: Session = Depends(get_db)):
    profile = db.scalar(select(Profile))
    return profile.to_dict() if profile else {}


@router.put("", dependencies=[Depends(get_current_user)])
def update_profile(payload: ProfileIn, db: Session = Depends(get_db)):
    profile = db.scalar(select(Profile))
    return save_object(db, Profile, payload.model_dump(exclude_unset=True), obj=profile).to_dict()

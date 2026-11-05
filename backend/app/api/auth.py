from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, get_current_user, hash_password, verify_password
from app.database.session import get_db
from app.models import User
from app.schemas.schemas import LoginIn
from app.services.ratelimit import limit_login

router = APIRouter(tags=["Auth"])

_DUMMY_HASH = hash_password("not-a-real-password")  # equalises timing for unknown usernames


@router.post("/login", dependencies=[Depends(limit_login)])
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))
    valid = verify_password(payload.password, user.hashed_password if user else _DUMMY_HASH)
    if not user or not valid or not user.is_admin:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return {"access_token": create_access_token(user.username), "token_type": "bearer"}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"username": user.username}

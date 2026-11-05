from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database.session import get_db
from app.models import ContactMessage
from app.schemas.schemas import ContactIn
from app.services.mailer import send_contact_notification
from app.services.ratelimit import client_ip, limit_contact

router = APIRouter(tags=["Contact"])
protected = [Depends(get_current_user)]


@router.post("", status_code=201, dependencies=[Depends(limit_contact)])
def submit(payload: ContactIn, background: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    ok = {"detail": "Message received. Thank you!"}
    if payload.website:  # honeypot filled in: pretend success, store nothing
        return ok
    msg = ContactMessage(
        name=payload.name, email=payload.email, subject=payload.subject,
        message=payload.message, ip=client_ip(request),
    )
    db.add(msg)
    db.commit()
    background.add_task(send_contact_notification, payload.name, payload.email, payload.subject, payload.message)
    return ok


@router.get("", dependencies=protected)
def list_messages(db: Session = Depends(get_db)):
    rows = db.scalars(select(ContactMessage).order_by(ContactMessage.id.desc())).all()
    return [m.to_dict() for m in rows]


@router.post("/{message_id}/read", dependencies=protected)
def mark_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, message_id)
    if msg is None:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return msg.to_dict()


@router.delete("/{message_id}", status_code=204, dependencies=protected)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, message_id)
    if msg is None:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return Response(status_code=204)

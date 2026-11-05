from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import get_current_user, get_optional_user
from app.database.session import get_db
from app.services.content import save_object
from app.services.images import storage


def make_crud_router(prefix, tag, Model, SchemaIn, order_by, *, publishable=False, apply=None, file_fields=()):
    """GET (public) and POST/PUT/DELETE (admin only) for one resource."""
    router = APIRouter(prefix=prefix, tags=[tag])
    protected = [Depends(get_current_user)]

    def get_or_404(db: Session, item_id: int):
        obj = db.get(Model, item_id)
        if obj is None:
            raise HTTPException(status_code=404, detail=f"{tag} item not found")
        return obj

    @router.get("")
    def list_items(db: Session = Depends(get_db), user=Depends(get_optional_user)):
        stmt = select(Model).order_by(*order_by)
        if publishable and user is None:
            stmt = stmt.where(Model.published.is_(True))
        return [o.to_dict() for o in db.scalars(stmt).unique().all()]

    @router.get("/{item_id}")
    def get_item(item_id: int, db: Session = Depends(get_db), user=Depends(get_optional_user)):
        obj = get_or_404(db, item_id)
        if publishable and user is None and not obj.published:
            raise HTTPException(status_code=404, detail=f"{tag} item not found")
        return obj.to_dict()

    @router.post("", status_code=201, dependencies=protected)
    def create_item(payload: SchemaIn, db: Session = Depends(get_db)):
        return save_object(db, Model, payload.model_dump(), apply).to_dict()

    @router.put("/{item_id}", dependencies=protected)
    def update_item(item_id: int, payload: SchemaIn, db: Session = Depends(get_db)):
        obj = get_or_404(db, item_id)
        return save_object(db, Model, payload.model_dump(exclude_unset=True), apply, obj).to_dict()

    @router.delete("/{item_id}", status_code=204, dependencies=protected)
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        obj = get_or_404(db, item_id)
        urls: list[str] = []
        for field in file_fields:
            if field == "screenshots":
                urls += [i.url for i in obj.images]
            else:
                value = getattr(obj, field, "")
                urls += value if isinstance(value, list) else [value]
        db.delete(obj)
        db.commit()
        for url in urls:
            storage.delete_url(url)
        return Response(status_code=204)

    return router

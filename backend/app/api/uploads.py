from fastapi import APIRouter, Depends, File, UploadFile

from app.auth.security import get_current_user
from app.services.images import save_image, save_pdf

router = APIRouter(tags=["Uploads"], dependencies=[Depends(get_current_user)])


@router.post("/image", status_code=201)
def upload_image(file: UploadFile = File(...)):
    return {"url": save_image(file)}


@router.post("/pdf", status_code=201)
def upload_pdf(file: UploadFile = File(...)):
    return {"url": save_pdf(file)}

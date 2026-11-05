
import io
import os
import re
import uuid

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import settings

Image.MAX_IMAGE_PIXELS = 40_000_000

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}
_URL_RE = re.compile(r"^/uploads/([a-f0-9]{32}(?:_sm)?\.(?:webp|pdf))$")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


class CloudinaryStorage:
    """Cloudinary storage that preserves existing /uploads/ database URLs."""

    def write_image(self, name: str, data: bytes) -> str:
        stem = name.removesuffix(".webp")
        cloudinary.uploader.upload(
            data,
            public_id=f"portfolio/{stem}",
            resource_type="image",
            overwrite=True,
            format="webp",
            use_filename=False,
            unique_filename=False,
        )
        return f"/uploads/{name}"

    def write_pdf(self, name: str, data: bytes) -> str:
        cloudinary.uploader.upload(
            data,
            public_id=f"portfolio/{name}",
            resource_type="raw",
            overwrite=True,
            use_filename=False,
            unique_filename=False,
        )
        return f"/uploads/{name}"

    def url_for(self, filename: str) -> str:
        match = _URL_RE.fullmatch(f"/uploads/{filename}")
        if not match:
            raise HTTPException(status_code=404, detail="File not found")

        name = match.group(1)

        if name.endswith(".pdf"):
            public_id = f"portfolio/{name}"
            resource_type = "raw"
        else:
            public_id = f"portfolio/{name[:-5]}"
            resource_type = "image"

        try:
            result = cloudinary.api.resource(
                public_id,
                resource_type=resource_type,
            )
            return result["secure_url"]
        except Exception:
            raise HTTPException(status_code=404, detail="File not found")

    def delete_url(self, url: str) -> None:
        match = _URL_RE.fullmatch(url or "")
        if not match:
            return

        name = match.group(1)

        try:
            if name.endswith(".pdf"):
                cloudinary.uploader.destroy(
                    f"portfolio/{name}",
                    resource_type="raw",
                    invalidate=True,
                )
            else:
                stem = name[:-5]
                if stem.endswith("_sm"):
                    return
                for image_stem in (stem, f"{stem}_sm"):
                    cloudinary.uploader.destroy(
                        f"portfolio/{image_stem}",
                        resource_type="image",
                        invalidate=True,
                    )
        except Exception:
            pass


storage = CloudinaryStorage()


def _read_bounded(upload: UploadFile) -> bytes:
    data = upload.file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(data) > settings.MAX_UPLOAD_BYTES:
        mb = settings.MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"File too large (max {mb} MB)")
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    return data


def _to_webp(img: Image.Image, max_side: int) -> bytes:
    copy = img.copy()
    copy.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    copy.save(buf, format="WEBP", quality=82, method=4)
    return buf.getvalue()


def save_image(upload: UploadFile) -> str:
    data = _read_bounded(upload)

    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()

        img = Image.open(io.BytesIO(data))
        fmt = img.format

        if fmt not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG, WebP or GIF images are allowed",
            )

        img = ImageOps.exif_transpose(img)
        img.load()

    except HTTPException:
        raise
    except (
        UnidentifiedImageError,
        OSError,
        SyntaxError,
        ValueError,
        Image.DecompressionBombError,
    ):
        raise HTTPException(status_code=400, detail="File is not a valid image")

    if img.mode in ("P", "LA", "PA"):
        img = img.convert("RGBA")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    name = uuid.uuid4().hex

    full = _to_webp(img, 1600)
    small = _to_webp(img, 480)

    storage.write_image(f"{name}.webp", full)
    storage.write_image(f"{name}_sm.webp", small)

    return f"/uploads/{name}.webp"


def save_pdf(upload: UploadFile) -> str:
    data = _read_bounded(upload)

    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    name = f"{uuid.uuid4().hex}.pdf"
    return storage.write_pdf(name, data)

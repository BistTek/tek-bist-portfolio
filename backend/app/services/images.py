import io
import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import settings

Image.MAX_IMAGE_PIXELS = 40_000_000  # decompression-bomb guard (PIL errors at 2x this)

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}
_URL_RE = re.compile(r"^/uploads/([a-f0-9]{32}(?:_sm)?\.(?:webp|pdf))$")


class LocalStorage:
    """Stores files on disk. To use S3/Cloudinary later, implement the same three methods."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def write(self, name: str, data: bytes) -> str:
        (self.root / name).write_bytes(data)
        return f"/uploads/{name}"

    def delete_url(self, url: str) -> None:
        m = _URL_RE.match(url or "")
        if not m:
            return
        name = m.group(1)
        names = [name]
        if name.endswith(".webp") and "_sm" not in name:
            names.append(name[:-5] + "_sm.webp")
        for n in names:
            (self.root / n).unlink(missing_ok=True)


storage = LocalStorage(settings.UPLOAD_DIR)


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
    copy.thumbnail((max_side, max_side), Image.LANCZOS)
    buf = io.BytesIO()
    copy.save(buf, format="WEBP", quality=82, method=4)
    return buf.getvalue()


def save_image(upload: UploadFile) -> str:
    """Validate the bytes are a real image, strip metadata, resize, store a full and a small WebP."""
    data = _read_bounded(upload)
    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()
        img = Image.open(io.BytesIO(data))
        fmt = img.format
        if fmt not in ALLOWED_FORMATS:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")
        img = ImageOps.exif_transpose(img)
        img.load()
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        raise HTTPException(status_code=400, detail="File is not a valid image")

    if img.mode in ("P", "LA", "PA"):
        img = img.convert("RGBA")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    name = uuid.uuid4().hex
    url = storage.write(f"{name}.webp", _to_webp(img, 1600))
    storage.write(f"{name}_sm.webp", _to_webp(img, 480))
    return url


def save_pdf(upload: UploadFile) -> str:
    data = _read_bounded(upload)
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")
    return storage.write(f"{uuid.uuid4().hex}.pdf", data)

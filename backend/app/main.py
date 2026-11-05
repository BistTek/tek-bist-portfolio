import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app import models  # noqa: F401  (registers tables)
from app.api import auth, contact, profile, routes, uploads
from app.config import settings
from app.database.session import Base, engine
from app.services.images import storage

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Portfolio API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENABLE_DOCS else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.ENABLE_DOCS else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_and_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    path = request.url.path
    if path.startswith("/uploads/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"  # random file names
    elif request.method == "GET" and path.startswith("/api/"):
        private = "authorization" in request.headers or path.startswith(("/api/auth", "/api/contact"))
        if private:
            response.headers["Cache-Control"] = "no-store"  # admin views include drafts
        else:
            response.headers.setdefault("Cache-Control", "public, max-age=60")
            response.headers.append("Vary", "Authorization")
    return response


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth")
app.include_router(profile.router, prefix="/api/profile")
app.include_router(contact.router, prefix="/api/contact")
app.include_router(uploads.router, prefix="/api/uploads")
app.include_router(routes.router, prefix="/api")

@app.get("/uploads/{filename}", include_in_schema=False)
def serve_upload(filename: str):
    return RedirectResponse(
        url=storage.url_for(filename),
        status_code=302,
    )
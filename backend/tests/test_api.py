import io
import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["UPLOAD_DIR"] = f"{_tmp}/uploads"
os.environ["SECRET_KEY"] = "x" * 48

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.auth.security import hash_password  # noqa: E402
from app.database.session import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        with SessionLocal() as db:
            db.add(User(username="admin", hashed_password=hash_password("correct-horse-battery"), is_admin=True))
            db.commit()
        yield c


@pytest.fixture(scope="module")
def auth(client):
    r = client.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-battery"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def png_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (40, 30), "red").save(buf, "PNG")
    return buf.getvalue()


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_login_rejects_bad_password(client):
    r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


def test_writes_require_auth(client):
    assert client.post("/api/projects", json={"title": "x"}).status_code == 401
    assert client.post("/api/uploads/image", files={"file": ("a.png", png_bytes(), "image/png")}).status_code == 401
    assert client.get("/api/contact").status_code == 401
    bad = {"Authorization": "Bearer not-a-token"}
    assert client.post("/api/projects", json={"title": "x"}, headers=bad).status_code == 401


def test_project_crud(client, auth):
    body = {"title": "My API", "category": "Web", "tech": ["FastAPI"], "screenshots": ["/uploads/" + "a" * 32 + ".webp"]}
    r = client.post("/api/projects", json=body, headers=auth)
    assert r.status_code == 201
    created = r.json()
    assert created["title"] == "My API" and created["screenshots"] and created["tech"] == ["FastAPI"]

    pid = created["id"]
    assert client.get(f"/api/projects/{pid}").json()["title"] == "My API"
    r = client.put(f"/api/projects/{pid}", json={"title": "Renamed", "github": "https://github.com/x/y"}, headers=auth)
    assert r.status_code == 200 and r.json()["title"] == "Renamed" and r.json()["tech"] == ["FastAPI"]
    assert any(p["id"] == pid for p in client.get("/api/projects").json())
    assert client.delete(f"/api/projects/{pid}", headers=auth).status_code == 204
    assert client.get(f"/api/projects/{pid}").status_code == 404


def test_rejects_javascript_urls(client, auth):
    r = client.post("/api/projects", json={"title": "x", "github": "javascript:alert(1)"}, headers=auth)
    assert r.status_code == 422
    r = client.post("/api/projects", json={"title": "x", "demo": "//evil.example"}, headers=auth)
    assert r.status_code == 422


def test_validation_requires_title(client, auth):
    assert client.post("/api/projects", json={"title": ""}, headers=auth).status_code == 422


def test_note_drafts_hidden_from_public(client, auth):
    r = client.post(
        "/api/notes",
        json={"title": "Draft note", "content": "word " * 450, "category": "Python", "tags": ["Python", "python", "Basics"], "published": False},
        headers=auth,
    )
    assert r.status_code == 201
    note = r.json()
    assert note["readingTime"] == "2 min"
    assert note["tags"] == ["basics", "python"] and note["category"] == "Python" and note["date"] and note["author"]

    assert all(n["id"] != note["id"] for n in client.get("/api/notes").json())
    assert client.get(f"/api/notes/{note['id']}").status_code == 404
    assert any(n["id"] == note["id"] for n in client.get("/api/notes", headers=auth).json())

    client.put(f"/api/notes/{note['id']}", json={"title": "Draft note", "published": True}, headers=auth)
    assert any(n["id"] == note["id"] for n in client.get("/api/notes").json())


def test_contact_validation_honeypot_and_success(client, auth):
    assert client.post("/api/contact", json={"name": "A", "email": "nope", "subject": "Hi", "message": "short"}).status_code == 422
    spam = {"name": "Bot", "email": "bot@example.com", "subject": "Buy", "message": "spam spam spam spam", "website": "http://spam"}
    assert client.post("/api/contact", json=spam).status_code == 201
    ok = {"name": "Real", "email": "real@example.com", "subject": "Hello", "message": "I would like to hire you."}
    assert client.post("/api/contact", json=ok).status_code == 201

    msgs = client.get("/api/contact", headers=auth).json()
    assert [m["name"] for m in msgs] == ["Real"]  # honeypot message was not stored
    assert "ip" not in msgs[0]


def test_upload_rejects_fake_and_oversized(client, auth):
    r = client.post("/api/uploads/image", files={"file": ("x.png", b"not an image", "image/png")}, headers=auth)
    assert r.status_code == 400
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    assert client.post("/api/uploads/image", files={"file": ("x.svg", svg, "image/svg+xml")}, headers=auth).status_code == 400
    big = b"%PDF-" + b"0" * (6 * 1024 * 1024)
    assert client.post("/api/uploads/pdf", files={"file": ("big.pdf", big, "application/pdf")}, headers=auth).status_code == 413


def test_upload_image_and_serve(client, auth):
    r = client.post("/api/uploads/image", files={"file": ("pic.png", png_bytes(), "image/png")}, headers=auth)
    assert r.status_code == 201
    url = r.json()["url"]
    assert url.startswith("/uploads/") and url.endswith(".webp")
    assert client.get(url).status_code == 200
    assert client.get(url.replace(".webp", "_sm.webp")).status_code == 200


def test_photo_delete_removes_file(client, auth):
    url = client.post("/api/uploads/image", files={"file": ("p.png", png_bytes(), "image/png")}, headers=auth).json()["url"]
    photo = client.post("/api/photos", json={"title": "Pic", "src": url, "category": "Travel"}, headers=auth).json()
    assert photo["category"] == "Travel"
    assert client.delete(f"/api/photos/{photo['id']}", headers=auth).status_code == 204
    assert client.get(url).status_code == 404


def test_pdf_upload_and_profile(client, auth):
    r = client.post("/api/uploads/pdf", files={"file": ("cv.pdf", b"%PDF-1.4 test", "application/pdf")}, headers=auth)
    assert r.status_code == 201
    cv = r.json()["url"]
    assert client.get("/api/profile").json() == {}
    r = client.put("/api/profile", json={"name": "Er. Tek Bist", "email": "tek@example.com", "cvFile": cv}, headers=auth)
    assert r.status_code == 200 and r.json()["cvFile"] == cv
    assert client.get("/api/profile").json()["name"] == "Er. Tek Bist"
    assert client.put("/api/profile", json={"email": "not-an-email"}, headers=auth).status_code == 422


def test_authenticated_responses_not_cached(client, auth):
    assert client.get("/api/projects", headers=auth).headers["cache-control"] == "no-store"
    assert "max-age" in client.get("/api/projects").headers["cache-control"]


def test_cors_allows_only_configured_origin(client):
    ok = client.options("/api/projects", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    bad = client.options("/api/projects", headers={"Origin": "http://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in bad.headers

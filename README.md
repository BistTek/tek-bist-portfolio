# Er. Tek Bist: Portfolio

A full-stack portfolio for a Computer Engineer: React + Vite + Tailwind frontend, FastAPI + SQLite backend,
JWT-protected admin dashboard, Markdown technical notes, photo gallery, certifications, experience and a contact form.

It runs in two modes:

| Mode | When | Content comes from | Admin / contact form |
|------|------|--------------------|----------------------|
| **Static** | `VITE_API_URL` is empty | `frontend/src/data/*.json` | not available |
| **Full-stack** | `VITE_API_URL` points to the API | the database (edit in `/admin`) | works |

All sample content is labelled `[PLACEHOLDER]`. Nothing personal is invented.

## Features
Home (hero, animated tech marquee, CV button), About (timeline), Skills (grouped, no fake percentages),
Projects (filters + detail pages), Technical Notes (Markdown, search, categories, tags, related notes, drafts),
Gallery (masonry, lightbox with keyboard, search/filter, auto-optimised WebP), Certifications, Experience,
Resume, Contact (validation, honeypot, rate limit, optional email alert), dark/light mode, SEO metadata,
sitemap/robots, code splitting, lazy images, admin dashboard for everything.

## Tech stack
React 18, Vite, Tailwind CSS, React Router, react-markdown · FastAPI, SQLAlchemy 2, Pydantic v2, PyJWT, bcrypt, Pillow ·
SQLite (dev) → PostgreSQL (change `DATABASE_URL`).

## Project structure
```
portfolio/
├── frontend/   React app (src/pages, components, hooks, services, data)
├── backend/    FastAPI app (app/api, models, schemas, services, auth, database), scripts/, tests/
├── docs/       put screenshots here
└── README.md
```

## 1. Install dependencies
Requires Node.js 18+ and Python 3.10+.
```bash
# frontend
cd frontend && npm install

# backend (new terminal)
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configure environment variables
```bash
cd backend && cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste the result as SECRET_KEY in backend/.env
cd ../frontend && cp .env.example .env                          # VITE_API_URL=http://localhost:8000
```
Secrets live only in `.env` files (git-ignored). Variables are documented inside `backend/.env.example`.

## 3. Create the database and the admin account
Tables are created automatically on first start. Then, from `backend/` with the venv active:
```bash
python -m scripts.create_admin     # asks for username and a password of 10+ characters
python -m scripts.seed             # optional: load the placeholder sample content
```
Passwords are stored as bcrypt hashes. Run `create_admin` again with the same username to reset a password.

## 4. Start the backend
```bash
cd backend && uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs · health check: http://localhost:8000/api/health

## 5. Start the frontend
```bash
cd frontend && npm run dev          # http://localhost:5173
```

## 6. Manage content (admin dashboard)
Open http://localhost:5173/admin/login and sign in. Tabs:
- **Profile**: name, bio, interests, social links, profile photo, CV (PDF upload). Do this first.
- **Projects**: title, category, details, GitHub/demo links, cover image, screenshots, publish toggle.
- **Notes**: Markdown editor with preview; untick *Published* to keep a draft.
- **Gallery**: upload photos with title, category, date, tags, description.
- **Certificates**, **Experience**, **Education**, **Skills**.
- **Messages**: contact-form submissions.

The first thing to replace is the placeholder text. If you run `seed`, edit or delete the `[PLACEHOLDER]` rows.

## API overview
Public `GET`, admin-only writes (`Authorization: Bearer <token>`). Full interactive docs at `/docs`.
```
POST /api/auth/login                       GET /api/auth/me
GET|PUT /api/profile
GET|POST /api/projects      GET|PUT|DELETE /api/projects/{id}
GET|POST /api/notes         GET|PUT|DELETE /api/notes/{id}        (drafts only visible to admin)
GET|POST /api/photos        GET|PUT|DELETE /api/photos/{id}
GET|POST /api/certifications, /api/experience, /api/education, /api/skills  (+ PUT/DELETE by id)
POST /api/contact           GET /api/contact (admin)
POST /api/uploads/image     POST /api/uploads/pdf                 (admin)
```

## Security notes
bcrypt password hashing · JWT with expiry · login rate-limit (10 / 15 min) · contact rate-limit (5 / hour) + honeypot ·
Pydantic validation on every write · links must be `http(s)`, `mailto:` or site-relative (blocks `javascript:`) ·
uploads: real-image check, 5 MB limit, re-encoded to WebP (strips EXIF/GPS), SVG rejected, random file names ·
CORS limited to `ALLOWED_ORIGINS` · Markdown rendered without raw HTML · no secrets in source.
The admin token is kept in `sessionStorage` (cleared when the tab closes). Rate limits are per-process; use Redis
if you ever run many workers. Behind a proxy, make sure the client IP is forwarded correctly.

## Run the tests
```bash
cd backend && pip install -r requirements-dev.txt && pytest
```

## 7. Deploy
**Frontend (static)**: Vercel, Netlify or Cloudflare Pages. Root directory `frontend`, build `npm run build`,
output `dist`. `vercel.json` and `public/_redirects` already handle page refreshes. For full-stack mode set the
environment variable `VITE_API_URL` to your deployed API URL. Without it the site deploys in static mode.

**Backend**: any host that runs Python or Docker (Render, Railway, Fly.io, a VPS). `backend/Dockerfile` is included
(not exercised in the build environment, so test it once). Set `SECRET_KEY`, `ALLOWED_ORIGINS` (your frontend URL,
exact origin), `DATABASE_URL`. Run `python -m scripts.create_admin` once on the server.
- SQLite file and `uploads/` need a **persistent disk/volume**. Many free tiers wipe the disk on redeploy.
- **PostgreSQL**: `pip install psycopg2-binary`, set `DATABASE_URL=postgresql+psycopg2://user:pass@host/db`.
- **Cloudinary / S3**: uploads go through `LocalStorage` in `backend/app/services/images.py`; implement the same
  `write` / `delete_url` methods for another store.
- Set `ENABLE_DOCS=false` in production if you don't want public API docs.

**Before launch checklist**
1. Replace `[PLACEHOLDER]` content; put your CV in the Profile tab (or `frontend/public/cv-tek-bist.pdf` in static mode).
2. Replace `YOUR-DOMAIN.com` in `frontend/public/sitemap.xml` and `robots.txt`.
3. Update the name/description in `frontend/index.html` if they change.
4. Use a long unique admin password.

## Static mode: editing content without the backend
Edit `frontend/src/data/*.json` (profile, skills, projects, notes, photos, certifications, experience, education)
and put images/CV in `frontend/public/`.

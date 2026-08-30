# UniQuest Backend

AI-powered gamified learning platform — FastAPI backend.

---

## Tech Stack

- **FastAPI** + **Uvicorn** — async web framework
- **PostgreSQL** + **SQLAlchemy (async)** — database
- **Alembic** — migrations
- **Argon2** — password hashing
- **JWT** (python-jose) — auth tokens
- **Google Gemini** — AI Tutor, Study Planner, Recommendations
- **scikit-learn** — ML performance prediction (RandomForest)
- **pytest + aiosqlite** — test suite (no Postgres needed)

---

## Quick Start

### 1. Clone and set up environment

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET_KEY, GEMINI_API_KEY
```

Minimum required `.env`:
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/uniquest
JWT_SECRET_KEY=your-secret-key-at-least-32-characters-long
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### 3. Set up PostgreSQL database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE uniquest;"
```

### 4. Run migrations

```bash
alembic upgrade head
```

### 5. Seed demo data

```bash
python -m app.database.seed
```

This seeds:
- 12 Achievements
- 8 Daily Quests
- 6 Rewards
- 5 Courses (DBMS, OS, DSA, Networks, AI/ML) with modules, lessons, quizzes
- 1 Demo user: `demo@uniquest.edu` / `UniQuest2024!`

Seed is **idempotent** — safe to run multiple times.

### 6. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: http://localhost:8000/docs

---

## Running Tests

Tests use SQLite in-memory — **no PostgreSQL needed**.

```bash
pytest tests/ -v
```

Run a specific file:
```bash
pytest tests/test_auth.py -v
pytest tests/test_quizzes.py -v
```

Current result: **89 tests, all passing**.

---

## API Endpoints Summary

All routes are prefixed with `/api/v1`.

| Group | Endpoints |
|-------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| **Users** | `GET /users/profile`, `PATCH /users/profile`, `POST /users/onboarding`, `GET /users/me/stats`, `GET /users/me/activity` |
| **Courses** | `GET /courses/`, `GET /courses/{id}`, `POST /courses/{id}/enroll`, `GET /courses/{id}/progress` |
| **Lessons** | `GET /lessons/{id}`, `POST /lessons/{id}/start`, `POST /lessons/{id}/complete` |
| **Quizzes** | `GET /quizzes/{id}`, `POST /quizzes/{id}/submit`, `GET /quizzes/history` |
| **Gamification** | `GET /gamification/stats`, `GET /gamification/quests`, `POST /gamification/quests/{id}/claim`, `GET /gamification/achievements`, `GET /gamification/leaderboard?scope=weekly` |
| **Analytics** | `GET /analytics/overview`, `GET /analytics/progress`, `GET /analytics/subjects`, `GET /analytics/weak-topics`, `GET /analytics/study-time` |
| **ML** | `GET /analytics/ml-prediction`, `GET /analytics/performance` |
| **AI** | `POST /ai/tutor`, `POST /ai/study-planner`, `GET /ai/recommendations`, `POST /ai/explain-answer` |
| **Revision** | `GET /revision/due`, `POST /revision/{id}/review` |
| **Notifications** | `GET /notifications`, `POST /notifications/{id}/read`, `POST /notifications/read-all` |

---

## AI / ML Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Gemini** | Google Generative AI | AI Tutor, Study Planner, Recommendations, Wrong-answer explanations |
| **RandomForest** | scikit-learn | Performance prediction (at_risk / average / strong) |
| **SM-2** | Pure Python | Spaced repetition scheduling |
| **Deterministic** | Backend logic | XP, coins, levels, streaks, quests, achievements — never trust frontend |

AI features fail gracefully if `GEMINI_API_KEY` is missing — returns 503 or empty list, never crashes.

ML returns `{"prediction": "insufficient_data"}` until the user has ≥5 quiz attempts.

---

## Demo Credentials

After running seed:

| Field | Value |
|-------|-------|
| Email | `demo@uniquest.edu` |
| Password | `UniQuest2024!` |
| XP | 1240 |
| Level | 12 |
| Streak | 7 days |

---

## Deployment

### Environment variables for production

```
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET_KEY=<strong-random-key>
GEMINI_API_KEY=<your-key>
FRONTEND_URL=https://your-frontend-domain.com
ENVIRONMENT=production
```

In production, `ENVIRONMENT=production`:
- Swagger UI is disabled
- Alembic migrations run automatically on startup
- CORS is restricted to `FRONTEND_URL`

### Run with gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (optional)

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Project Structure

```
backend/
├── app/
│   ├── ai/              # Gemini AI features (tutor, planner, recommendations)
│   ├── core/            # Config, security, dependencies, logging
│   ├── database/        # Session, base, init_db, seed.py
│   ├── ml/              # RandomForest feature engineering + model
│   ├── models/          # SQLAlchemy ORM models (20 tables)
│   ├── routers/         # FastAPI route handlers (13 routers)
│   ├── schemas/         # Pydantic request/response models
│   ├── services/        # Business logic (auth, gamification, quiz, lesson)
│   └── utils/           # Error handlers
├── alembic/             # Database migrations
├── tests/               # pytest test suite (89 tests)
├── .env.example
├── requirements.txt
└── README.md
```

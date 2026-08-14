# UniQuest Backend – Implementation Plan

## 1. Project Overview

UniQuest is an AI-powered gamified learning platform for university students. This document
describes the complete backend architecture, database design, API surface, and implementation
strategy.

**Team**
- Mahek Saradava – Backend + AI/ML
- Mahek Patel – Frontend (React + Vite)

---

## 2. Architecture

```
Modular Monolith – FastAPI
─────────────────────────────────────────────────────────
  app/
  ├── core/           Configuration, security, dependencies, logging
  ├── database/       SQLAlchemy session, base model, init helpers
  ├── models/         SQLAlchemy ORM models (one file per domain)
  ├── schemas/        Pydantic v2 request/response schemas
  ├── routers/        FastAPI route handlers (thin layer)
  ├── services/       Business logic (XP, streaks, quests, …)
  ├── ai/             Gemini client + AI feature modules
  ├── ml/             Scikit-learn feature engineering + prediction
  └── utils/          Error helpers, response helpers, validators
```

No microservices. No message queues. No Redis (unless leaderboard caching is needed later).
Single PostgreSQL database. Alembic for migrations.

---

## 3. Database ER Summary

### Core Entities

| Table | Key Columns |
|---|---|
| users | id (UUID), email, hashed_password, role, university, department, semester, xp, coins, level |
| courses | id (UUID), title, description, subject, difficulty, is_published |
| modules | id (UUID), course_id FK, title, order_index |
| lessons | id (UUID), module_id FK, title, content, duration_minutes, order_index |
| quizzes | id (UUID), lesson_id FK (nullable), module_id FK (nullable), title |
| questions | id (UUID), quiz_id FK, text, options (JSONB), correct_answer, explanation |
| quiz_attempts | id (UUID), user_id FK, quiz_id FK, score, answers (JSONB), completed_at |
| study_sessions | id (UUID), user_id FK, lesson_id FK (nullable), duration_seconds, started_at, ended_at |
| user_progress | id (UUID), user_id FK, lesson_id FK, is_completed, completed_at, time_spent_seconds |
| course_enrollments | id (UUID), user_id FK, course_id FK, enrolled_at, completed_at |
| xp_history | id (UUID), user_id FK, amount, source, description, created_at |
| coin_transactions | id (UUID), user_id FK, amount (+ or −), type, description, created_at |
| streaks | id (UUID), user_id FK (unique), current_streak, longest_streak, last_active_date |
| achievements | id (UUID), key (unique), name, description, xp_reward, coin_reward, icon |
| user_achievements | id (UUID), user_id FK, achievement_id FK, unlocked_at |
| quests | id (UUID), title, description, quest_type, target_value, xp_reward, coin_reward, is_daily |
| user_quests | id (UUID), user_id FK, quest_id FK, progress, completed, assigned_date, completed_at |
| rewards | id (UUID), name, description, cost_coins, is_active |
| user_rewards | id (UUID), user_id FK, reward_id FK, redeemed_at |
| leaderboard_snapshots | id (UUID), user_id FK, period_type, period_key, xp, rank, created_at |
| ai_recommendations | id (UUID), user_id FK, recommendation_type, content (JSONB), created_at |
| revision_topics | id (UUID), user_id FK, topic, subject, difficulty, performance_score, next_revision_date, interval_days |
| study_plans | id (UUID), user_id FK, plan_data (JSONB), generated_at, expires_at |
| notifications | id (UUID), user_id FK, type, title, message, is_read, created_at |
| refresh_tokens | id (UUID), user_id FK, token_hash, expires_at, revoked |

---

## 4. Complete API List

### Authentication `/api/v1/auth`
- `POST /register` – Create account
- `POST /login` – JWT login
- `POST /refresh` – Refresh access token
- `POST /logout` – Revoke refresh token
- `GET  /me` – Current user info

### Users `/api/v1/users`
- `GET  /me` – Profile
- `PUT  /me` – Update profile
- `GET  /me/stats` – XP, level, coins, streak summary
- `GET  /me/activity` – Recent activity feed

### Courses `/api/v1/courses`
- `GET  /` – List courses (with filters)
- `POST /` – Create course (instructor/admin)
- `GET  /{id}` – Course detail
- `PUT  /{id}` – Update course
- `GET  /{id}/modules` – List modules
- `POST /{id}/enroll` – Enroll student
- `GET  /{id}/progress` – Course progress for current user

### Modules `/api/v1/modules`
- `POST /` – Create module
- `GET  /{id}` – Module detail with lessons
- `PUT  /{id}` – Update module

### Lessons `/api/v1/lessons`
- `GET  /{id}` – Lesson detail
- `POST /{id}/start` – Start study session
- `POST /{id}/complete` – Mark complete + award XP

### Quizzes `/api/v1/quizzes`
- `GET  /` – List quizzes
- `POST /` – Create quiz (admin/instructor)
- `GET  /{id}` – Quiz + questions
- `POST /{id}/attempt` – Submit attempt
- `GET  /{id}/result/{attempt_id}` – Result detail
- `GET  /history` – User quiz history

### Progress `/api/v1/progress`
- `GET  /lessons` – Completed lessons
- `GET  /courses` – Course completion percentages

### Gamification `/api/v1/gamification`
- `GET  /xp` – XP history
- `GET  /level` – Current level info
- `GET  /coins` – Coin balance + history
- `POST /coins/redeem` – Redeem reward
- `GET  /achievements` – Unlocked achievements
- `GET  /quests` – Active daily quests
- `GET  /leaderboard` – Leaderboard (weekly/university/global)
- `GET  /streak` – Streak info

### Analytics `/api/v1/analytics`
- `GET  /overview` – Dashboard summary
- `GET  /progress` – Learning progress over time
- `GET  /subjects` – Per-subject performance
- `GET  /weak-topics` – Detected weak topics
- `GET  /study-time` – Study time breakdown

### AI Tutor `/api/v1/ai`
- `POST /tutor` – Ask AI tutor a question
- `POST /study-plan` – Generate AI study plan
- `GET  /recommendations` – Personalized recommendations
- `POST /explain-answer` – Explain why an answer was wrong

### Revision `/api/v1/revision`
- `GET  /today` – Topics due for revision today
- `POST /{topic_id}/complete` – Mark revision complete

### Study Planner `/api/v1/study-planner`
- `POST /generate` – Generate AI study plan
- `GET  /current` – Get current active plan

---

## 5. AI Architecture

```
Student Request
     │
     ▼
FastAPI Router
     │
     ▼
AI Service (app/ai/)
     ├── gemini_client.py   — Authenticated Gemini API wrapper
     ├── tutor.py           — AI Tutor feature
     ├── study_planner.py   — Study plan generation
     ├── recommendations.py — Personalized learning paths
     ├── revision.py        — Spaced repetition logic
     └── prompts.py         — All prompt templates
     │
     ▼
Google Gemini API
     │
     ▼
Pydantic validation of response
     │
     ▼
Return to frontend (or fallback on error)
```

**Key rule**: Gemini is never used for XP/coins/scores. Only for explanations and natural language.

---

## 6. ML Architecture

```
PostgreSQL (user activity data)
     │
     ▼
Pandas DataFrame (feature extraction)
     │
     ▼
Feature Engineering (app/ml/feature_engineering.py)
  - quiz_accuracy
  - attempt_count
  - avg_study_time_minutes
  - lesson_completion_rate
  - streak_days
  - consistency_score
  - recent_performance_trend
     │
     ▼
Scikit-learn Model (RandomForestClassifier)
  app/ml/performance_model.py
     │
     ▼
Prediction: "at_risk" | "average" | "strong"
  (returns "insufficient_data" if < 5 data points)
```

---

## 7. Gamification Design

### XP Values
| Action | XP |
|---|---|
| Daily login | 10 |
| Lesson completion | 20 |
| Quiz completion | 30 |
| Quiz score ≥ 80% | +20 bonus |
| Quiz score ≥ 90% | +40 bonus |
| Daily quest completed | 25 |
| Study session ≥ 30 min | 15 |
| Streak milestone (7 days) | 50 |

### Level Thresholds
| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Beginner |
| 5 | 500 | Explorer |
| 10 | 1500 | Learner |
| 15 | 3000 | Student |
| 20 | 5000 | Scholar |
| 25 | 8000 | Advanced |
| 30 | 12000 | Expert |
| 40 | 20000 | Master |
| 50 | 35000 | Legend |

### Coin Sources
- Quiz completion: 10 coins
- High score (≥80%): 20 coins
- Daily login: 5 coins
- Quest completion: varies

---

## 8. Testing Strategy

- pytest + pytest-asyncio
- FastAPI TestClient (sync) for router tests
- Separate test database (SQLite in-memory or test PostgreSQL schema)
- Test files mirror app structure: `tests/test_auth.py`, `tests/test_gamification.py`, etc.
- Fixtures: test user, test course, test quiz, authenticated client
- Coverage targets: auth, gamification engine, streak logic, quiz scoring

---

## 9. Deployment Strategy

- Railway or Render (Python + PostgreSQL)
- Environment variables for all secrets
- `alembic upgrade head` on startup
- CORS configured via `FRONTEND_URL` env var
- Production: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 10. Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Repository inspection + this plan |
| 2 | Foundation: FastAPI, config, DB, Alembic, logging, error handling |
| 3 | Authentication: register, login, JWT, refresh, logout |
| 4 | Users, Courses, Modules, Lessons, Progress |
| 5 | Quiz System (manual only, NO AI generation) |
| 6 | Gamification: XP, levels, coins, streaks, quests, achievements, leaderboard |
| 7 | AI Tutor (Gemini) |
| 8 | Recommendation Engine + Smart Revision |
| 9 | AI Study Planner |
| 10 | Analytics |
| 11 | ML Performance Prediction |
| 12 | Full integration + tests |
| 13 | Linting, docs, deployment config |

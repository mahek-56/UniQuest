"""
UniQuest Backend – FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.utils.errors import http_exception_handler, validation_exception_handler

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown tasks."""
    logger.info("UniQuest API starting", version=settings.APP_VERSION, env=settings.ENVIRONMENT)

    # In production, run alembic migrations; in dev/test use direct table creation
    if settings.ENVIRONMENT == "production":
        from app.database.init_db import run_migrations
        run_migrations()
    else:
        from app.database.init_db import create_tables
        await create_tables()

    yield
    logger.info("UniQuest API shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered gamified learning platform for university students",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ────────────────────────────────────────────────────────

app.add_exception_handler(RequestValidationError, validation_exception_handler)

from fastapi import HTTPException
app.add_exception_handler(HTTPException, http_exception_handler)

# ── Routers ───────────────────────────────────────────────────────────────────

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.courses import courses_router, modules_router, lessons_router
from app.routers.quizzes import router as quizzes_router
from app.routers.progress import router as progress_router
from app.routers.gamification import router as gamification_router
from app.routers.analytics import router as analytics_router
from app.routers.ai_router import router as ai_router
from app.routers.revision import router as revision_router
from app.routers.study_planner import router as study_planner_router

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(courses_router, prefix=API_PREFIX)
app.include_router(modules_router, prefix=API_PREFIX)
app.include_router(lessons_router, prefix=API_PREFIX)
app.include_router(quizzes_router, prefix=API_PREFIX)
app.include_router(progress_router, prefix=API_PREFIX)
app.include_router(gamification_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(revision_router, prefix=API_PREFIX)
app.include_router(study_planner_router, prefix=API_PREFIX)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION, "env": settings.ENVIRONMENT}

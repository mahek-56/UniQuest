"""
Test configuration for UniQuest.
Uses SQLite (aiosqlite) — no PostgreSQL needed to run tests.

Tables are created once per session. Data is wiped after every test
so each test gets a clean slate.
"""

import os

# ── MUST be before any app import ────────────────────────────────────────────
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_uniquest.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-at-least-32-chars-long!!"
os.environ["ENVIRONMENT"] = "testing"
os.environ["GEMINI_API_KEY"] = ""

from app.core.config import get_settings  # noqa: E402
get_settings.cache_clear()               # force re-read with new env vars

import pytest_asyncio                    # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine  # noqa: E402

import app.models  # noqa: F401, E402 – register all ORM models
from app.database.base import Base      # noqa: E402
from app.database.session import get_db  # noqa: E402
from app.main import app                 # noqa: E402

# ── Engine ────────────────────────────────────────────────────────────────────

from sqlalchemy.pool import StaticPool  # noqa: E402

TEST_DB_URL = "sqlite+aiosqlite://"  # pure in-memory SQLite

test_engine = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    echo=False,
    poolclass=StaticPool,  # single shared connection → all fixtures see same DB
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Create tables once, wipe data after every test ───────────────────────────

@pytest_asyncio.fixture(scope="session", autouse=True)
async def _create_tables():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _wipe_data(_create_tables):  # depends on tables existing
    """Delete all rows after every test for full isolation."""
    yield
    async with test_engine.begin() as conn:
        # Delete in reverse dependency order
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())


# ── Per-test session & client ─────────────────────────────────────────────────

@pytest_asyncio.fixture
async def db_session():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """HTTP test client backed by the test DB."""
    async def _override():
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    app.dependency_overrides[get_db] = _override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Helper fixtures ───────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def registered_user(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "test@uniquest.edu",
        "password": "TestPass123!",
        "full_name": "Test Student",
        "university": "Test University",
        "department": "Computer Science",
        "semester": 5,
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest_asyncio.fixture
async def auth_headers(registered_user: dict):
    return {"Authorization": f"Bearer {registered_user['access_token']}"}


@pytest_asyncio.fixture
async def second_user(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "second@uniquest.edu",
        "password": "TestPass123!",
        "full_name": "Second Student",
    })
    assert resp.status_code == 201, resp.text
    return resp.json()

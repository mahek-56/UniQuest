"""
Database initialization helpers.
run_migrations() is called on startup in production.
create_tables() is used by the test suite.
"""

import subprocess
from pathlib import Path

from app.core.logging import get_logger
from app.database.session import engine

logger = get_logger(__name__)


async def create_tables() -> None:
    """Create all tables directly (used in tests, not in production)."""
    from app.database.base import Base
    # Import all models so their metadata is populated
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")


async def drop_tables() -> None:
    """Drop all tables (test teardown)."""
    from app.database.base import Base
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("Database tables dropped")


def run_migrations() -> None:
    """Run alembic migrations (called on app startup in production)."""
    alembic_ini = Path(__file__).parent.parent.parent / "alembic.ini"
    if alembic_ini.exists():
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            logger.error("Alembic migration failed", stderr=result.stderr)
            raise RuntimeError(f"Migration failed: {result.stderr}")
        logger.info("Alembic migrations applied", stdout=result.stdout)
    else:
        logger.warning("alembic.ini not found – skipping migrations")

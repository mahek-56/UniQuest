"""
Authentication business logic: register, login, refresh, logout.
"""

import hashlib
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import RefreshToken, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from fastapi import HTTPException, status
from jose import JWTError

logger = get_logger(__name__)


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


async def register_user(db: AsyncSession, payload: RegisterRequest) -> User:
    # Check for existing email
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        university=payload.university,
        department=payload.department,
        semester=payload.semester,
        role="student",
    )
    db.add(user)
    await db.flush()   # get the id without committing

    # Initialise gamification: create streak row
    from app.models.gamification import Streak
    db.add(Streak(user_id=user.id))

    logger.info("User registered", user_id=str(user.id), email=user.email)
    return user


async def login_user(db: AsyncSession, payload: LoginRequest) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    from datetime import timedelta
    from app.core.config import settings

    token_row = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh),
        expires_at=datetime.now(tz=timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(token_row)

    # Update last_login
    user.last_login = datetime.now(tz=timezone.utc)

    logger.info("User logged in", user_id=str(user.id))
    return TokenResponse(access_token=access, refresh_token=refresh)


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> str:
    try:
        payload = decode_refresh_token(refresh_token)
        user_id = payload["sub"]
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    token_hash = _hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False,  # noqa: E712
        )
    )
    token_row = result.scalar_one_or_none()
    if not token_row or token_row.expires_at < datetime.now(tz=timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked",
        )

    return create_access_token(user_id)


async def logout_user(db: AsyncSession, refresh_token: str) -> None:
    token_hash = _hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    token_row = result.scalar_one_or_none()
    if token_row:
        token_row.revoked = True
    # Silently succeed even if token not found

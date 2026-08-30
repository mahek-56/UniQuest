"""
Notification endpoints: /api/v1/notifications
Matches frontend notificationApi.js contract exactly.
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.core.dependencies import CurrentUser, DBSession
from app.models.notification import Notification
from app.schemas.notification import MarkReadResponse, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _format_notification(n: Notification) -> NotificationResponse:
    """Convert ORM Notification → frontend-compatible response."""
    # Build human-readable timestamp
    now = datetime.now(tz=timezone.utc)
    diff = now - (n.created_at.replace(tzinfo=timezone.utc) if n.created_at.tzinfo is None else n.created_at)
    total_seconds = int(diff.total_seconds())

    if total_seconds < 60:
        human_time = "Just now"
    elif total_seconds < 3600:
        minutes = total_seconds // 60
        human_time = f"{minutes} min{'s' if minutes > 1 else ''} ago"
    elif total_seconds < 86400:
        hours = total_seconds // 3600
        human_time = f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif total_seconds < 172800:
        human_time = "Yesterday"
    else:
        days = total_seconds // 86400
        human_time = f"{days} days ago"

    return NotificationResponse(
        id=n.id,
        title=n.title,
        message=n.message,
        type=n.notification_type,
        notification_type=n.notification_type,
        read=n.is_read,
        is_read=n.is_read,
        timestamp=human_time,
        created_at=n.created_at,
    )


@router.get("", response_model=list[NotificationResponse])
async def get_notifications(current_user: CurrentUser, db: DBSession, limit: int = 50):
    """GET /notifications — returns all notifications for the current user."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    notifications = result.scalars().all()
    return [_format_notification(n) for n in notifications]


@router.get("/unread", response_model=list[NotificationResponse])
async def get_unread_notifications(current_user: CurrentUser, db: DBSession):
    """GET /notifications/unread — returns only unread notifications."""
    result = await db.execute(
        select(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    notifications = result.scalars().all()
    return [_format_notification(n) for n in notifications]


@router.post("/{notification_id}/read", response_model=MarkReadResponse)
async def mark_as_read(notification_id: UUID, current_user: CurrentUser, db: DBSession):
    """POST /notifications/{id}/read — mark a single notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    notification.is_read = True
    return MarkReadResponse(success=True, notification_id=notification_id)


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_as_read(current_user: CurrentUser, db: DBSession):
    """POST /notifications/read-all — mark all notifications as read."""
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
        .values(is_read=True)
    )

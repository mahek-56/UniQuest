"""
Notification schemas — matches frontend notificationApi.js contract.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    type: str                             # frontend field name
    notification_type: Optional[str] = None  # backend model field alias
    read: bool                            # frontend field name
    is_read: Optional[bool] = None        # backend model alias
    timestamp: Optional[str] = None      # human-readable, for frontend display
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MarkReadResponse(BaseModel):
    success: bool
    notification_id: UUID

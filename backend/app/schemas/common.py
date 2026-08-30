"""
Shared Pydantic schemas and response helpers.
"""

from typing import Generic, TypeVar
from pydantic import BaseModel

DataT = TypeVar("DataT")


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[DataT]):
    items: list[DataT]
    total: int
    page: int
    page_size: int
    pages: int

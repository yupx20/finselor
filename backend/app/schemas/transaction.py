"""Pydantic schemas for transaction endpoints."""

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.category import CategoryResponse


class TransactionCreate(BaseModel):
    """Schema for creating a transaction."""
    category_id: int
    amount: Decimal = Field(..., gt=0, max_digits=15, decimal_places=2)
    trx_date: date
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0, max_digits=15, decimal_places=2)
    trx_date: Optional[date] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    """Schema for transaction data in responses."""
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: int
    amount: Decimal
    trx_date: date
    notes: Optional[str]
    category: CategoryResponse

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    """Schema for paginated transaction list."""
    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int

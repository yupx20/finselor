"""Pydantic schemas for AI advisor endpoints."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AIAllocation(BaseModel):
    """Schema for a single asset allocation recommendation."""
    asset_class: str
    percentage: float
    amount: Decimal
    rationale: str


class AIAdvisorResponse(BaseModel):
    """Schema for AI advisor recommendation response."""
    surplus_basis: Decimal
    risk_profile: str
    allocations: list[AIAllocation]
    market_analysis: str
    risk_notes: str
    disclaimer: str


class AILogResponse(BaseModel):
    """Schema for AI recommendation log entry."""
    id: uuid.UUID
    surplus_basis: Decimal
    raw_response: dict
    generated_at: datetime

    model_config = {"from_attributes": True}

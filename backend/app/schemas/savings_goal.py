"""Pydantic schemas for savings goal endpoints."""

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class SavingsGoalCreate(BaseModel):
    """Schema for creating a savings goal."""
    title: str = Field(..., min_length=1, max_length=100)
    target_amount: Decimal = Field(..., gt=0, max_digits=15, decimal_places=2)
    deadline_date: Optional[date] = None


class SavingsGoalUpdate(BaseModel):
    """Schema for updating a savings goal."""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[Decimal] = Field(None, gt=0, max_digits=15, decimal_places=2)
    deadline_date: Optional[date] = None


class SavingsDepositRequest(BaseModel):
    """Schema for adding a deposit to a savings goal."""
    amount: Decimal = Field(..., gt=0, max_digits=15, decimal_places=2)


class SavingsGoalResponse(BaseModel):
    """Schema for savings goal data in responses."""
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_amount: Decimal
    current_amount: Decimal
    deadline_date: Optional[date]
    progress_percentage: float = 0.0

    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, goal) -> "SavingsGoalResponse":
        """Create response from SQLAlchemy model with computed progress."""
        target = float(goal.target_amount) if goal.target_amount else 1
        current = float(goal.current_amount) if goal.current_amount else 0
        progress = min((current / target) * 100, 100) if target > 0 else 0

        return cls(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            deadline_date=goal.deadline_date,
            progress_percentage=round(progress, 1),
        )

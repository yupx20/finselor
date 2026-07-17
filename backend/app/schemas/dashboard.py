"""Pydantic schemas for dashboard endpoints."""

from decimal import Decimal
from pydantic import BaseModel

from app.schemas.transaction import TransactionResponse


class MonthlySummary(BaseModel):
    """Schema for monthly financial summary."""
    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    surplus: Decimal
    transaction_count: int


class CategoryBreakdown(BaseModel):
    """Schema for spending by category."""
    category_name: str
    trx_type: str
    total: Decimal
    percentage: float


class DashboardResponse(BaseModel):
    """Schema for the main dashboard response."""
    summary: MonthlySummary
    income_breakdown: list[CategoryBreakdown]
    expense_breakdown: list[CategoryBreakdown]
    recent_transactions: list[TransactionResponse]


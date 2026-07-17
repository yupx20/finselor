"""Dashboard API endpoint — monthly financial summary."""

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.dashboard import CategoryBreakdown, DashboardResponse, MonthlySummary
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    month: int = Query(default=None, ge=1, le=12),
    year: int = Query(default=None, ge=2000, le=2100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get monthly dashboard summary with income/expense breakdowns."""
    # Default to current month
    today = date.today()
    if month is None:
        month = today.month
    if year is None:
        year = today.year

    # Compute date range for index-friendly filtering
    start_date = date(year, month, 1)
    end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)

    # Calculate totals
    totals_query = (
        select(
            func.coalesce(
                func.sum(
                    case(
                        (Category.trx_type == "INCOME", Transaction.amount),
                        else_=Decimal("0"),
                    )
                ),
                Decimal("0"),
            ).label("total_income"),
            func.coalesce(
                func.sum(
                    case(
                        (Category.trx_type == "EXPENSE", Transaction.amount),
                        else_=Decimal("0"),
                    )
                ),
                Decimal("0"),
            ).label("total_expense"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .join(Category, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.trx_date >= start_date,
            Transaction.trx_date < end_date,
        )
    )

    totals_result = await db.execute(totals_query)
    row = totals_result.one()

    total_income = row.total_income or Decimal("0")
    total_expense = row.total_expense or Decimal("0")
    surplus = total_income - total_expense

    summary = MonthlySummary(
        month=month,
        year=year,
        total_income=total_income,
        total_expense=total_expense,
        surplus=surplus,
        transaction_count=row.transaction_count or 0,
    )

    # Category breakdowns
    async def get_breakdown(trx_type: str) -> list[CategoryBreakdown]:
        breakdown_query = (
            select(
                Category.name,
                Category.trx_type,
                func.sum(Transaction.amount).label("total"),
            )
            .join(Category, Transaction.category_id == Category.id)
            .where(
                Transaction.user_id == current_user.id,
                Category.trx_type == trx_type,
                Transaction.trx_date >= start_date,
                Transaction.trx_date < end_date,
            )
            .group_by(Category.name, Category.trx_type)
            .order_by(func.sum(Transaction.amount).desc())
        )

        result = await db.execute(breakdown_query)
        rows = result.all()

        grand_total = sum(float(r.total) for r in rows) if rows else 1
        return [
            CategoryBreakdown(
                category_name=r.name,
                trx_type=r.trx_type,
                total=r.total,
                percentage=round((float(r.total) / grand_total) * 100, 1) if grand_total > 0 else 0,
            )
            for r in rows
        ]

    income_breakdown = await get_breakdown("INCOME")
    expense_breakdown = await get_breakdown("EXPENSE")

    # Recent transactions (last 5)
    recent_query = (
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.trx_date >= start_date,
            Transaction.trx_date < end_date,
        )
        .order_by(Transaction.trx_date.desc())
        .limit(5)
    )
    recent_result = await db.execute(recent_query)
    recent = recent_result.scalars().all()

    return DashboardResponse(
        summary=summary,
        income_breakdown=income_breakdown,
        expense_breakdown=expense_breakdown,
        recent_transactions=[TransactionResponse.model_validate(t) for t in recent],
    )


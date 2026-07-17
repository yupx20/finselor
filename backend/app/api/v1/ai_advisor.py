"""AI Advisor API endpoint."""

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.ai_log import AIRecommendationLog
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.ai_advisor import AIAdvisorResponse, AIAllocation, AILogResponse
from app.services.ai_service import get_ai_recommendation

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


@router.post("/recommend", response_model=AIAdvisorResponse)
async def get_recommendation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI investment recommendation based on current month surplus."""
    today = date.today()

    # Compute date range for index-friendly filtering
    start_date = date(today.year, today.month, 1)
    end_date = date(today.year + 1, 1, 1) if today.month == 12 else date(today.year, today.month + 1, 1)

    # Calculate monthly surplus
    income_query = (
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .join(Category)
        .where(
            Transaction.user_id == current_user.id,
            Category.trx_type == "INCOME",
            Transaction.trx_date >= start_date,
            Transaction.trx_date < end_date,
        )
    )

    expense_query = (
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .join(Category)
        .where(
            Transaction.user_id == current_user.id,
            Category.trx_type == "EXPENSE",
            Transaction.trx_date >= start_date,
            Transaction.trx_date < end_date,
        )
    )

    income_result = await db.execute(income_query)
    expense_result = await db.execute(expense_query)

    total_income = income_result.scalar() or Decimal("0")
    total_expense = expense_result.scalar() or Decimal("0")
    surplus = total_income - total_expense

    if surplus <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"No surplus available for investment. Income: {total_income}, Expenses: {total_expense}. You need a positive surplus to get recommendations.",
        )

    # Get AI recommendation (anonymized - no PII sent)
    raw_response = await get_ai_recommendation(surplus, current_user.risk_profile)

    # Save audit log
    log_entry = AIRecommendationLog(
        user_id=current_user.id,
        surplus_basis=surplus,
        raw_response=raw_response,
    )
    db.add(log_entry)
    await db.flush()

    # Build response
    allocations = [
        AIAllocation(
            asset_class=a["asset_class"],
            percentage=a["percentage"],
            amount=Decimal(str(a["amount"])),
            rationale=a["rationale"],
        )
        for a in raw_response.get("allocations", [])
    ]

    return AIAdvisorResponse(
        surplus_basis=surplus,
        risk_profile=current_user.risk_profile,
        allocations=allocations,
        market_analysis=raw_response.get("market_analysis", ""),
        risk_notes=raw_response.get("risk_notes", ""),
        disclaimer=raw_response.get("disclaimer", ""),
    )


@router.get("/history", response_model=list[AILogResponse])
async def get_recommendation_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI recommendation history for audit purposes."""
    result = await db.execute(
        select(AIRecommendationLog)
        .where(AIRecommendationLog.user_id == current_user.id)
        .order_by(AIRecommendationLog.generated_at.desc())
        .limit(10)
    )
    logs = result.scalars().all()
    return [AILogResponse.model_validate(log) for log in logs]

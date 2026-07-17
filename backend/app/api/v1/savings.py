"""Savings Goals CRUD API endpoints."""

import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.savings_goal import SavingsGoal
from app.models.user import User
from app.schemas.savings_goal import (
    SavingsDepositRequest,
    SavingsGoalCreate,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)

router = APIRouter(prefix="/savings", tags=["Savings Goals"])


@router.get("/", response_model=list[SavingsGoalResponse])
async def list_savings_goals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all savings goals for the current user."""
    result = await db.execute(
        select(SavingsGoal)
        .where(SavingsGoal.user_id == current_user.id)
        .order_by(SavingsGoal.deadline_date.asc().nullslast())
    )
    goals = result.scalars().all()
    return [SavingsGoalResponse.from_model(g) for g in goals]


@router.post("/", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_savings_goal(
    data: SavingsGoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new savings goal."""
    goal = SavingsGoal(
        user_id=current_user.id,
        title=data.title,
        target_amount=data.target_amount,
        deadline_date=data.deadline_date,
    )
    db.add(goal)
    await db.flush()
    await db.refresh(goal)

    return SavingsGoalResponse.from_model(goal)


@router.put("/{goal_id}", response_model=SavingsGoalResponse)
async def update_savings_goal(
    goal_id: uuid.UUID,
    data: SavingsGoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a savings goal."""
    result = await db.execute(
        select(SavingsGoal).where(
            SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    await db.flush()
    await db.refresh(goal)

    return SavingsGoalResponse.from_model(goal)


@router.post("/{goal_id}/deposit", response_model=SavingsGoalResponse)
async def add_deposit(
    goal_id: uuid.UUID,
    data: SavingsDepositRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a deposit to a savings goal."""
    result = await db.execute(
        select(SavingsGoal).where(
            SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    goal.current_amount = (goal.current_amount or Decimal("0")) + data.amount
    await db.flush()
    await db.refresh(goal)

    return SavingsGoalResponse.from_model(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_savings_goal(
    goal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a savings goal."""
    result = await db.execute(
        select(SavingsGoal).where(
            SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    await db.delete(goal)

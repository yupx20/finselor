"""Categories API endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.category import CategoryResponse

# Import model
from app.models.category import Category
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=list[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all transaction categories (master data)."""
    result = await db.execute(select(Category).order_by(Category.trx_type, Category.name))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(c) for c in categories]


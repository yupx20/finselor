"""Export API endpoint — CSV and XLSX download."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services.export_service import generate_csv, generate_xlsx

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/transactions")
async def export_transactions(
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    month: int = Query(default=None, ge=1, le=12),
    year: int = Query(default=None, ge=2000, le=2100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export transactions as CSV or XLSX."""
    today = date.today()
    if month is None:
        month = today.month
    if year is None:
        year = today.year

    # Compute date range for index-friendly filtering
    start_date = date(year, month, 1)
    end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)

    query = (
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.trx_date >= start_date,
            Transaction.trx_date < end_date,
        )
        .order_by(Transaction.trx_date.asc())
    )

    result = await db.execute(query)
    transactions = result.scalars().all()

    # Transform to dicts for export service
    trx_dicts = [
        {
            "trx_date": str(t.trx_date),
            "trx_type": t.category.trx_type,
            "category_name": t.category.name,
            "amount": float(t.amount),
            "notes": t.notes,
        }
        for t in transactions
    ]

    if format == "xlsx":
        output = generate_xlsx(trx_dicts, month, year)
        filename = f"finselor_transactions_{year}_{month:02d}.xlsx"
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    else:
        output = generate_csv(trx_dicts)
        filename = f"finselor_transactions_{year}_{month:02d}.csv"
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

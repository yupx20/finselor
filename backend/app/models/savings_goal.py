"""Savings Goal SQLAlchemy model."""

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SavingsGoal(Base):
    """Savings goals table — tracks financial targets and progress."""

    __tablename__ = "savings_goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        CheckConstraint("target_amount > 0", name="ck_savings_target_positive"),
        nullable=False,
    )
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        default=0,
        nullable=False,
    )
    deadline_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    user = relationship("User", back_populates="savings_goals")

    def __repr__(self) -> str:
        return f"<SavingsGoal {self.title} {self.current_amount}/{self.target_amount}>"

"""Category SQLAlchemy model — master data."""

from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    """Categories table — master data for transaction classification."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    trx_type: Mapped[str] = mapped_column(
        String(10),
        CheckConstraint(
            "trx_type IN ('INCOME', 'EXPENSE')",
            name="ck_categories_trx_type",
        ),
        nullable=False,
    )

    # Relationships
    transactions = relationship("Transaction", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category {self.name} ({self.trx_type})>"

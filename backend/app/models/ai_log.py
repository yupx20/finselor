"""AI Recommendation Log SQLAlchemy model — audit trail."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AIRecommendationLog(Base):
    """AI recommendation logs table — stores Gemini API responses for audit."""

    __tablename__ = "ai_recommendation_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    surplus_basis: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False
    )
    raw_response: Mapped[dict] = mapped_column(JSONB, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="ai_logs")

    def __repr__(self) -> str:
        return f"<AIRecommendationLog {self.id} surplus={self.surplus_basis}>"

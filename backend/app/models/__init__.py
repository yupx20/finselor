"""Models package — import all models so SQLAlchemy mappers register them."""

from app.models.user import User  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.savings_goal import SavingsGoal  # noqa: F401
from app.models.ai_log import AIRecommendationLog  # noqa: F401

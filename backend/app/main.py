"""Finselor API — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import create_tables

# Import all models to register them with SQLAlchemy
from app.models.user import User  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.savings_goal import SavingsGoal  # noqa: F401
from app.models.ai_log import AIRecommendationLog  # noqa: F401

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.savings import router as savings_router
from app.api.v1.ai_advisor import router as ai_advisor_router
from app.api.v1.export import router as export_router

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    logger.info("🚀 Starting Finselor API...")
    await create_tables()
    logger.info("✅ Database tables created/verified")
    yield
    logger.info("👋 Shutting down Finselor API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Personal finance management with AI-powered investment advice",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routers
API_V1_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(categories_router, prefix=API_V1_PREFIX)
app.include_router(transactions_router, prefix=API_V1_PREFIX)
app.include_router(dashboard_router, prefix=API_V1_PREFIX)
app.include_router(savings_router, prefix=API_V1_PREFIX)
app.include_router(ai_advisor_router, prefix=API_V1_PREFIX)
app.include_router(export_router, prefix=API_V1_PREFIX)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}

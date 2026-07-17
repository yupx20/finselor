"""Pydantic schemas for category endpoints."""

from pydantic import BaseModel


class CategoryResponse(BaseModel):
    """Schema for category data in responses."""
    id: int
    name: str
    trx_type: str

    model_config = {"from_attributes": True}

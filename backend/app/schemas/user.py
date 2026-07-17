"""Pydantic schemas for user authentication endpoints."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration."""
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(..., max_length=150)
    password: str = Field(..., min_length=8, max_length=128)
    risk_profile: str = Field(default="Moderate", pattern="^(Conservative|Moderate|Aggressive)$")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., max_length=150)
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: uuid.UUID
    full_name: str
    email: str
    risk_profile: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

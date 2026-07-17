"""Database seeder — populates categories and a demo user with sample data."""

import asyncio
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.core.database import async_session_factory, create_tables
from app.core.security import hash_password
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.savings_goal import SavingsGoal

# Master categories
CATEGORIES = [
    # Income
    {"name": "Salary", "trx_type": "INCOME"},
    {"name": "Freelance", "trx_type": "INCOME"},
    {"name": "Investment Returns", "trx_type": "INCOME"},
    {"name": "Bonus", "trx_type": "INCOME"},
    {"name": "Other Income", "trx_type": "INCOME"},
    # Expense
    {"name": "Housing & Rent", "trx_type": "EXPENSE"},
    {"name": "Electricity Bill", "trx_type": "EXPENSE"},
    {"name": "Water Bill", "trx_type": "EXPENSE"},
    {"name": "Internet & Phone", "trx_type": "EXPENSE"},
    {"name": "Food & Groceries", "trx_type": "EXPENSE"},
    {"name": "Transportation", "trx_type": "EXPENSE"},
    {"name": "Healthcare", "trx_type": "EXPENSE"},
    {"name": "Education", "trx_type": "EXPENSE"},
    {"name": "Entertainment", "trx_type": "EXPENSE"},
    {"name": "Shopping", "trx_type": "EXPENSE"},
    {"name": "Insurance", "trx_type": "EXPENSE"},
    {"name": "Charity & Donations", "trx_type": "EXPENSE"},
    {"name": "Other Expenses", "trx_type": "EXPENSE"},
]


async def seed():
    """Seed the database with master data and a demo user."""
    await create_tables()

    async with async_session_factory() as session:
        # Check if already seeded
        result = await session.execute(select(Category))
        if result.scalars().first():
            print("⚠️  Database already seeded. Skipping.")
            return

        print("🌱 Seeding categories...")
        categories = []
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            session.add(cat)
            categories.append(cat)

        await session.flush()

        # Map category names to IDs
        cat_map = {c.name: c.id for c in categories}

        print("👤 Creating demo user...")
        demo_user = User(
            full_name="Demo User",
            email="demo@finselor.com",
            password_hash=hash_password("demo1234"),
            risk_profile="Moderate",
        )
        session.add(demo_user)
        await session.flush()

        print("💰 Creating sample transactions...")
        today = date.today()
        current_month = today.month
        current_year = today.year

        # Sample transactions for current month
        sample_transactions = [
            {"category": "Salary", "amount": Decimal("15000000.00"), "day": 1, "notes": "Monthly salary"},
            {"category": "Freelance", "amount": Decimal("3500000.00"), "day": 5, "notes": "Web development project"},
            {"category": "Housing & Rent", "amount": Decimal("3000000.00"), "day": 1, "notes": "Monthly rent"},
            {"category": "Electricity Bill", "amount": Decimal("450000.00"), "day": 3, "notes": "July electricity"},
            {"category": "Water Bill", "amount": Decimal("150000.00"), "day": 3, "notes": "July water"},
            {"category": "Internet & Phone", "amount": Decimal("350000.00"), "day": 2, "notes": "Internet subscription"},
            {"category": "Food & Groceries", "amount": Decimal("2500000.00"), "day": 4, "notes": "Weekly groceries"},
            {"category": "Food & Groceries", "amount": Decimal("800000.00"), "day": 10, "notes": "Dining out"},
            {"category": "Transportation", "amount": Decimal("600000.00"), "day": 5, "notes": "Fuel and toll"},
            {"category": "Healthcare", "amount": Decimal("350000.00"), "day": 8, "notes": "Monthly vitamins"},
            {"category": "Entertainment", "amount": Decimal("500000.00"), "day": 7, "notes": "Streaming subscriptions"},
            {"category": "Shopping", "amount": Decimal("750000.00"), "day": 12, "notes": "Office supplies"},
            {"category": "Insurance", "amount": Decimal("1200000.00"), "day": 1, "notes": "Health insurance premium"},
            {"category": "Bonus", "amount": Decimal("2000000.00"), "day": 10, "notes": "Performance bonus"},
        ]

        for trx in sample_transactions:
            day = min(trx["day"], 28)  # Safe for all months
            trx_date = date(current_year, current_month, day)
            if trx_date > today:
                trx_date = today

            transaction = Transaction(
                user_id=demo_user.id,
                category_id=cat_map[trx["category"]],
                amount=trx["amount"],
                trx_date=trx_date,
                notes=trx["notes"],
            )
            session.add(transaction)

        print("🎯 Creating sample savings goals...")
        goals = [
            SavingsGoal(
                user_id=demo_user.id,
                title="Emergency Fund",
                target_amount=Decimal("50000000.00"),
                current_amount=Decimal("15000000.00"),
                deadline_date=date(current_year + 1, 6, 30),
            ),
            SavingsGoal(
                user_id=demo_user.id,
                title="New Laptop",
                target_amount=Decimal("20000000.00"),
                current_amount=Decimal("12500000.00"),
                deadline_date=date(current_year, 12, 31),
            ),
            SavingsGoal(
                user_id=demo_user.id,
                title="Vacation Fund",
                target_amount=Decimal("10000000.00"),
                current_amount=Decimal("3200000.00"),
                deadline_date=date(current_year + 1, 3, 1),
            ),
        ]

        for goal in goals:
            session.add(goal)

        await session.commit()
        print("✅ Database seeded successfully!")
        print(f"   Demo login: demo@finselor.com / demo1234")


if __name__ == "__main__":
    asyncio.run(seed())

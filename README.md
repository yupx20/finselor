# 🧠 Finselor — Smart Personal Finance Manager

A fullstack personal finance management application with AI-powered investment advice.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tech Stack](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?logo=google)

## ✨ Features

- **📊 Cashflow Tracker** — Record income/expenses with category classification and monthly analytics
- **🎯 Savings Goals** — Set targets with visual progress tracking and deposit management
- **🤖 AI Investment Advisor** — Get AI-powered asset allocation based on your surplus and risk profile
- **📥 Data Export** — Download transactions as styled Excel or CSV files
- **🔐 Secure Auth** — JWT authentication with bcrypt password hashing

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (≥ 20 recommended)
- **Python** ≥ 3.10
- **Docker** & Docker Compose (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data
python seed.py

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:3000**

**Demo credentials:** `demo@finselor.com` / `demo1234`

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://finselor:finselor_secret@localhost:5432/finselor_db` | PostgreSQL connection |
| `JWT_SECRET_KEY` | (dev default) | JWT signing secret |
| `GEMINI_API_KEY` | (empty) | Google Gemini API key for AI advisor |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Backend API URL |

## 📁 Project Structure

```
finselor/
├── frontend/          # Next.js + Tailwind CSS
│   ├── app/           # Pages (App Router)
│   ├── lib/           # API client, auth, utils
│   └── ...
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/v1/    # API endpoints
│   │   ├── core/      # Config, database, security
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic DTOs
│   │   └── services/  # Business logic (AI, export)
│   └── seed.py        # Database seeder
├── docker-compose.yml # PostgreSQL service
└── README.md
```

## 🔒 Security & Privacy

- Passwords hashed with **bcrypt**
- API endpoints protected by **JWT** tokens
- **UUID v4** primary keys to prevent enumeration
- AI prompts are **fully anonymized** — no PII is sent to Google Gemini
- Data architecture follows **UU PDP** principles

## 📜 License

MIT

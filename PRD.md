# Product Requirements Document (PRD): Finselor

## 1. Executive Summary
Finselor is a web-based personal finance management application that operates as a digital financial assistant. The system allows users to track cash flow, set savings goals, and receive automated investment allocation recommendations driven by artificial intelligence. Built using a modern technology stack (Next.js, FastAPI, PostgreSQL), this project demonstrates fullstack software engineering capabilities, secure relational database design, data processing, and external AI API integration.

## 2. Goals & Success Metrics

*   **User Goals:** To have a centralized platform for monitoring monthly financial health and receiving tactical guidance for allocating surplus funds into various investment instruments.
*   **Technical Goals (Portfolio):** To build an industry-scale system with high-integrity database design, strictly validated API endpoints, and a fast, interactive interface.
*   **Success Metrics:**
    *   API response time (latency) consistently under 500ms.
    *   Database CRUD operations run without anomalies with strict implementation of Foreign Keys and Constraints.
    *   The AI model processes prompts and returns 100% valid JSON formatted responses to be visualized by the frontend.

---

## 3. Key Features (Functionality)

### 3.1. Cashflow Tracker
*   Daily income and expense recording module.
*   Transaction categorization using supporting master data (e.g., Salary, Utilities, Food).
*   Analytical dashboard presenting an automated summary of the current month's surplus or deficit.

### 3.2. Savings Goals
*   Creation of specific financial targets (e.g., Emergency Fund, Asset Purchase) along with amounts and deadlines.
*   Savings deposit tracking integrated with visual progress bar indicators.

### 3.3. AI Investment Advisor (Digital Assistant)
*   The system analyzes monthly financial surplus data and maps allocation recommendations to various asset classes (such as mutual funds, stocks, forex, to cryptocurrency) according to the user's risk profile.
*   The provided advice includes basic risk management notes and a brief analysis of market momentum.

### 3.4. Data Management (Export/Import)
*   Export function for transaction data to CSV or Excel (.xlsx) formats.
*   Exported data goes through a systematic cleaning and validation process, making it ready to be processed using advanced formulas or integrated into standard financial reports.

---

## 4. Compliance, Privacy & Security (Non-Functional)

These requirements ensure the application is viable for use in a regulated financial ecosystem.

| Aspect | Implementation Standard |
| :--- | :--- |
| **Data Privacy Compliance** | Data architecture is designed in alignment with the principles of the **Personal Data Protection Law (UU PDP)**. User identity data (PII) is encrypted and separated from analytical processes. When sending prompts to external AI models, the system must perform absolute anonymization (not sending names, emails, or profile IDs). |
| **Authentication Security** | All API communication channels modifying data are protected by **JSON Web Tokens (JWT)** authentication. User passwords are hashed using the **Bcrypt** algorithm at the backend level. |
| **Database Integrity** | Utilization of **UUID (v4)** data types for all Primary Keys to prevent data enumeration by external parties, as well as the application of `NUMERIC` types for currency value precision. |

---

## 5. Architecture & Technology Stack

Below is the definitive technology stack along with recommendations for the best ecosystem tools to support it:

*   **Frontend:** **Next.js (React)** paired with **Tailwind CSS**. Provides fast Server-Side Rendering (SSR) performance and responsive UI components.
*   **Backend:** **FastAPI (Python)**. Offers extremely high asynchronous performance, ideal for acting as a digital assistant processing financial data. Utilizes **Pydantic** for automated validation of incoming and outgoing data payloads.
*   **Database:** **PostgreSQL**. The industry standard relational database. Interaction from Python will be managed using **SQLAlchemy** as the ORM (Object-Relational Mapping).
*   **AI Engine:** **Google Gemini API**. Uses the free tier with structured prompting to generate predictive analytical outputs.
*   **Deployment Infrastructure (Best Recommendations):**
    *   *Frontend:* **Vercel** (Integrates perfectly with Next.js).
    *   *Backend:* **Render** or **Railway** (Supports Python/FastAPI containers well).
    *   *Database:* **Supabase** or **Neon** (Robust managed serverless PostgreSQL providers with free tiers).

---

## 6. User Flow

### Phase 1: Onboarding & Security
1.  Users access the registration page and input credentials along with their investment risk profile preferences (Conservative/Moderate/Aggressive).
2.  The system encrypts the password and issues an authorization token (JWT).
3.  The user enters the Main Dashboard.

### Phase 2: Daily Operations
1.  On the Dashboard interface, the user selects **"Add Transaction"**.
2.  The user inputs the amount, selects a category from a dropdown connected to master data, and sets the date.
3.  The transaction is processed through FastAPI, validated by Pydantic (rejecting negative amounts), and saved to PostgreSQL. Dashboard metrics are instantly updated.

### Phase 3: Goal Achievement
1.  The user accesses the **"Savings"** menu and sets a new target.
2.  Over time, the user adds allocation balances to that target, and the Next.js frontend renders the progress bar animation interactively.

### Phase 4: AI Analytics
1.  The user requests investment advice via the **"AI Advisor"** menu.
2.  FastAPI executes a PostgreSQL aggregation query to calculate total income minus expenses (surplus) for that month, combined with the risk profile.
3.  The aggregated (anonymized) data is sent to the Gemini API.
4.  Gemini returns a JSON format validated by the backend, which is then displayed on the frontend as a donut chart (pie chart) of asset portfolio distribution and a financial guidance narrative.

---

## 7. Database Schema (Data Dictionary & ERD)

This schema design implements historical logging (audit trail) to track system decisions.

> **Note:** This schema uses `ON DELETE CASCADE` parameters to maintain derived data cleanliness, and `ON DELETE RESTRICT` on categories to maintain master data stability.

**1. `users` Table**
| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated (v4) |
| `full_name` | VARCHAR(100)| NOT NULL | User's display name |
| `email` | VARCHAR(150)| UNIQUE, NOT NULL | Used for authentication (JWT) |
| `password_hash` | VARCHAR(255)| NOT NULL | Bcrypt hash |
| `risk_profile` | VARCHAR(20) | CHECK validation | ENUM: Conservative, Moderate, Aggressive |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration time |

**2. `categories` Table (Master Data)**
| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INC| Category ID |
| `name` | VARCHAR(50) | NOT NULL | e.g., Salary, Electricity Bill |
| `trx_type` | VARCHAR(10) | CHECK validation | ENUM: 'INCOME' or 'EXPENSE' |

**3. `transactions` Table**
| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated (v4) |
| `user_id` | UUID | FOREIGN KEY | References `users(id)` (CASCADE) |
| `category_id` | INT | FOREIGN KEY | References `categories(id)` (RESTRICT) |
| `amount` | NUMERIC(15,2)| CHECK (> 0) | Ensures nominal validation |
| `trx_date` | DATE | NOT NULL | Transaction date |
| `notes` | TEXT | NULLABLE | Optional notes |

**4. `savings_goals` Table**
| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated (v4) |
| `user_id` | UUID | FOREIGN KEY | References `users(id)` (CASCADE) |
| `title` | VARCHAR(100)| NOT NULL | Target name (e.g., Buy BBCA Stock) |
| `target_amount` | NUMERIC(15,2)| CHECK (> 0) | Total target fund |
| `current_amount`| NUMERIC(15,2)| DEFAULT 0 | Collected balance |
| `deadline_date` | DATE | NULLABLE | Achievement deadline |

**5. `ai_recommendation_logs` Table (Audit Trail)**
| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Auto-generated (v4) |
| `user_id` | UUID | FOREIGN KEY | References `users(id)` (CASCADE) |
| `surplus_basis` | NUMERIC(15,2)| NOT NULL | Monetary value serving as the basis for analysis |
| `raw_response` | JSONB | NOT NULL | Stores JSON output from LLM |
| `generated_at` | TIMESTAMP | DEFAULT NOW() | Timestamp (Audit reporting) |

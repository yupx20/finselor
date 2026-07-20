import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT interceptor — attach token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("finselor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("finselor_token");
      localStorage.removeItem("finselor_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ===== API TYPES =====
export interface User {
  id: string;
  full_name: string;
  email: string;
  risk_profile: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  trx_type: "INCOME" | "EXPENSE";
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  trx_date: string;
  notes: string | null;
  category: Category;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  surplus: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category_name: string;
  trx_type: string;
  total: number;
  percentage: number;
}

export interface DashboardData {
  summary: MonthlySummary;
  income_breakdown: CategoryBreakdown[];
  expense_breakdown: CategoryBreakdown[];
  recent_transactions: Transaction[];
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline_date: string | null;
  progress_percentage: number;
}

export interface AIAllocation {
  asset_class: string;
  percentage: number;
  amount: number;
  rationale: string;
}

export interface AIAdvisorResponse {
  surplus_basis: number;
  risk_profile: string;
  allocations: AIAllocation[];
  market_analysis: string;
  risk_notes: string;
  disclaimer: string;
}

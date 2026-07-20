"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api, { DashboardData } from "@/lib/api";
import { formatCurrency, formatCompact, formatDateShort, getCurrentMonthName, CHART_COLORS } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get<DashboardData>("/dashboard/");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass-card p-8">
          <p className="text-lg mb-2" style={{ color: 'var(--color-expense)' }}>⚠️ {error}</p>
          <button onClick={fetchDashboard} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, income_breakdown, expense_breakdown, recent_transactions } = data;

  const barChartData = [
    { name: "Income", value: Number(summary.total_income), fill: "#10B981" },
    { name: "Expenses", value: Number(summary.total_expense), fill: "#F43F5E" },
    { name: "Surplus", value: Number(summary.surplus), fill: "#3B82F6" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {getCurrentMonthName()} — Financial Overview
          </p>
        </div>
        <div className="badge" style={{ background: 'var(--color-ai-bg)', color: 'var(--color-ai)', border: '1px solid var(--color-ai-border)' }}>
          {summary.transaction_count} transactions
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {/* Income */}
        <div className="glass-card stat-card income p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Income</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-income-bg)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-income)' }}>
            {formatCurrency(Number(summary.total_income))}
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card stat-card expense p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Expenses</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-expense-bg)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-expense)' }}>
            {formatCurrency(Number(summary.total_expense))}
          </div>
        </div>

        {/* Surplus */}
        <div className="glass-card stat-card surplus p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Monthly Surplus</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-glow)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: Number(summary.surplus) >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {formatCurrency(Number(summary.surplus))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip
                  contentStyle={{
                    background: '#1E293B',
                    border: '1px solid rgba(51,65,85,0.5)',
                    borderRadius: 10,
                    color: '#F1F5F9',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
          {expense_breakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expense_breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="category_name"
                    >
                      {expense_breakdown.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1E293B',
                        border: '1px solid rgba(51,65,85,0.5)',
                        borderRadius: 10,
                        color: '#F1F5F9',
                      }}
                      formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 max-h-48 overflow-y-auto">
                {expense_breakdown.map((item, i) => (
                  <div key={item.category_name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="flex-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>{item.category_name}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
              No expenses recorded this month
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <a href="/dashboard/transactions" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
            View All →
          </a>
        </div>
        {recent_transactions.length > 0 ? (
          <div className="space-y-3">
            {recent_transactions.map((trx) => (
              <div key={trx.id} className="flex items-center gap-4 p-3 rounded-xl transition-colors" style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: trx.category.trx_type === "INCOME" ? 'var(--color-income-bg)' : 'var(--color-expense-bg)',
                  }}
                >
                  {trx.category.trx_type === "INCOME" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{trx.category.name}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatDateShort(trx.trx_date)}{trx.notes ? ` · ${trx.notes}` : ""}
                  </div>
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: trx.category.trx_type === "INCOME" ? 'var(--color-income)' : 'var(--color-expense)' }}
                >
                  {trx.category.trx_type === "INCOME" ? "+" : "-"}{formatCurrency(Number(trx.amount))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Start by adding your first transaction</p>
          </div>
        )}
      </div>
    </div>
  );
}

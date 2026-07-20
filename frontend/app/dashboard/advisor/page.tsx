"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api, { AIAdvisorResponse } from "@/lib/api";
import { formatCurrency, CHART_COLORS } from "@/lib/utils";

export default function AdvisorPage() {
  const [data, setData] = useState<AIAdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendation = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await api.post<AIAdvisorResponse>("/advisor/recommend");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to get recommendation. Make sure you have a positive monthly surplus.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (profile: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Conservative: { bg: "var(--color-income-bg)", text: "var(--color-income)", border: "var(--color-income-border)" },
      Moderate: { bg: "var(--color-accent-glow)", text: "var(--color-accent)", border: "rgba(59,130,246,0.3)" },
      Aggressive: { bg: "var(--color-expense-bg)", text: "var(--color-expense)", border: "var(--color-expense-border)" },
    };
    return colors[profile] || colors.Moderate;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">🤖</span> AI Investment Advisor
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            AI-powered investment allocation based on your surplus and risk profile
          </p>
        </div>
      </div>

      {/* Generate CTA */}
      {!data && !loading && (
        <div
          className="glass-card p-8 text-center relative overflow-hidden"
          style={{ border: '1px solid var(--color-ai-border)' }}
        >
          {/* Decorative gradient */}
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 50% 0%, #8B5CF6, transparent 70%)' }} />

          <div className="relative">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-xl font-semibold mb-2">Get AI Investment Advice</h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Our AI analyzes your monthly surplus and risk profile to recommend optimal asset allocation across mutual funds, stocks, bonds, forex, and cryptocurrency.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm max-w-md mx-auto" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
                {error}
              </div>
            )}

            <button
              onClick={fetchRecommendation}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Generate Recommendation
            </button>

            <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
              🔒 Your personal data is never sent to AI — only anonymized surplus and risk profile
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 text-center" style={{ border: '1px solid var(--color-ai-border)' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--color-ai-bg)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--color-ai)' }} />
          </div>
          <p className="text-lg font-medium">Analyzing your finances...</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Our AI is calculating optimal allocations
          </p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="glass-card p-4 flex flex-wrap items-center gap-4" style={{ border: '1px solid var(--color-ai-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Surplus Basis:</span>
              <span className="font-semibold" style={{ color: 'var(--color-income)' }}>
                {formatCurrency(Number(data.surplus_basis))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Risk Profile:</span>
              <span
                className="badge"
                style={{
                  background: getRiskBadge(data.risk_profile).bg,
                  color: getRiskBadge(data.risk_profile).text,
                  border: `1px solid ${getRiskBadge(data.risk_profile).border}`,
                }}
              >
                {data.risk_profile}
              </span>
            </div>
            <div className="ml-auto">
              <button onClick={fetchRecommendation} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Donut Chart + Allocations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.allocations}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="percentage"
                      nameKey="asset_class"
                      label={({ asset_class, percentage }: any) => `${asset_class} ${percentage}%`}
                      labelLine={false}
                    >
                      {data.allocations.map((_, index) => (
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
                      formatter={(value: any, name: any, props: any) => [
                        `${value}% (${formatCurrency(Number(props.payload.amount))})`,
                        props.payload.asset_class,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Allocation Details */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Allocation Details</h2>
              <div className="space-y-3">
                {data.allocations.map((alloc, i) => (
                  <div key={alloc.asset_class} className="p-3 rounded-xl" style={{ background: 'var(--color-surface-100)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="font-medium flex-1">{alloc.asset_class}</span>
                      <span className="text-sm font-semibold">{alloc.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>{alloc.rationale}</span>
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-income)' }}>
                      {formatCurrency(Number(alloc.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Analysis & Risk Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📊</span> Market Analysis
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {data.market_analysis}
              </p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>⚠️</span> Risk Notes
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {data.risk_notes}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl text-xs text-center" style={{ background: 'var(--color-surface-100)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            <strong>Disclaimer:</strong> {data.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

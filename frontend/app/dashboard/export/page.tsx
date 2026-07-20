"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ExportPage() {
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await api.get("/export/transactions", {
        params: { format, month, year },
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `finselor_transactions_${year}_${String(month).padStart(2, "0")}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Export Data</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Download your transaction data as CSV or Excel files
        </p>
      </div>

      <div className="max-w-lg">
        <div className="glass-card p-8">
          {/* Format Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className="p-4 rounded-xl text-center transition-all duration-200"
                style={{
                  background: format === "xlsx" ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-100)',
                  border: `2px solid ${format === "xlsx" ? 'var(--color-income)' : 'var(--color-border)'}`,
                }}
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold text-sm" style={{ color: format === "xlsx" ? 'var(--color-income)' : 'var(--color-text-primary)' }}>
                  Excel (.xlsx)
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Styled & formatted
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className="p-4 rounded-xl text-center transition-all duration-200"
                style={{
                  background: format === "csv" ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-surface-100)',
                  border: `2px solid ${format === "csv" ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                <div className="text-3xl mb-2">📄</div>
                <div className="font-semibold text-sm" style={{ color: format === "csv" ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                  CSV (.csv)
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Universal format
                </div>
              </button>
            </div>
          </div>

          {/* Period */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="select-field"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="select-field"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg text-sm mb-6" style={{ background: 'var(--color-ai-bg)', border: '1px solid var(--color-ai-border)', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-ai)' }}>Data Quality:</strong>{" "}
            Exported data undergoes cleaning and validation. Amounts are verified, dates are formatted, and categories are validated against master data.
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {loading ? "Exporting..." : `Download ${format.toUpperCase()}`}
          </button>

          {/* Success */}
          {success && (
            <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ background: 'var(--color-income-bg)', color: 'var(--color-income)', border: '1px solid var(--color-income-border)' }}>
              ✅ File downloaded successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

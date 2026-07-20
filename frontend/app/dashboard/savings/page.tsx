"use client";

import { useEffect, useState } from "react";
import api, { SavingsGoal } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get<SavingsGoal[]>("/savings/");
      setGoals(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormTarget("");
    setFormDeadline("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setFormTitle(goal.title);
    setFormTarget(String(goal.target_amount));
    setFormDeadline(goal.deadline_date || "");
    setFormError("");
    setShowModal(true);
  };

  const openDeposit = (goalId: string) => {
    setDepositGoalId(goalId);
    setDepositAmount("");
    setFormError("");
    setShowDepositModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: formTitle,
        target_amount: parseFloat(formTarget),
        deadline_date: formDeadline || null,
      };

      if (editingId) {
        await api.put(`/savings/${editingId}`, payload);
      } else {
        await api.post("/savings/", payload);
      }

      setShowModal(false);
      fetchGoals();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      await api.post(`/savings/${depositGoalId}/deposit`, {
        amount: parseFloat(depositAmount),
      });
      setShowDepositModal(false);
      fetchGoals();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to add deposit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this savings goal?")) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
    } catch {}
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "var(--color-income)";
    if (progress >= 60) return "var(--color-accent)";
    if (progress >= 30) return "var(--color-warning)";
    return "var(--color-expense)";
  };

  const getGradient = (progress: number) => {
    if (progress >= 100) return "var(--gradient-income)";
    if (progress >= 50) return "var(--gradient-primary)";
    return "linear-gradient(135deg, #F59E0B, #FBBF24)";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Savings Goals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Track your financial targets
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg mb-2">No savings goals yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Set your first financial target to start saving!
          </p>
          <button onClick={openCreate} className="btn-primary">Create Your First Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {goals.map((goal) => (
            <div key={goal.id} className="glass-card p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  {goal.deadline_date && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Due: {formatDate(goal.deadline_date)}
                    </p>
                  )}
                </div>
                <div
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{
                    color: getStatusColor(goal.progress_percentage),
                    background: goal.progress_percentage >= 100 ? 'var(--color-income-bg)' : 'var(--color-accent-glow)',
                  }}
                >
                  {goal.progress_percentage}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="progress-bar-track" style={{ height: 10 }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(goal.progress_percentage, 100)}%`,
                      background: getGradient(goal.progress_percentage),
                    }}
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-sm mb-6">
                <div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Saved</div>
                  <div className="font-semibold" style={{ color: 'var(--color-income)' }}>
                    {formatCurrency(Number(goal.current_amount))}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: 'var(--color-text-muted)' }}>Target</div>
                  <div className="font-semibold">{formatCurrency(Number(goal.target_amount))}</div>
                </div>
              </div>

              {/* Remaining */}
              <div className="text-center text-sm mb-4 p-2 rounded-lg" style={{ background: 'var(--color-surface-100)', color: 'var(--color-text-secondary)' }}>
                {Number(goal.target_amount) - Number(goal.current_amount) > 0
                  ? `${formatCurrency(Number(goal.target_amount) - Number(goal.current_amount))} remaining`
                  : "🎉 Goal achieved!"}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openDeposit(goal.id)} className="btn-primary flex-1 text-sm py-2">
                  + Deposit
                </button>
                <button onClick={() => openEdit(goal)} className="btn-secondary text-sm py-2 px-3" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(goal.id)} className="btn-danger text-sm py-2 px-3" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? "Edit Goal" : "New Savings Goal"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Goal Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Emergency Fund"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Target Amount (IDR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input-field"
                  placeholder="50,000,000"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {editingId ? "Update Goal" : "Create Goal"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6">Add Deposit</h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Deposit Amount (IDR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input-field"
                  placeholder="1,000,000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  Add Deposit
                </button>
                <button type="button" onClick={() => setShowDepositModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

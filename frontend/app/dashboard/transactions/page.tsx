"use client";

import { useEffect, useState } from "react";
import api, { Transaction, TransactionList, Category } from "@/lib/api";
import { formatCurrency, formatDate, getTodayISO } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");

  // Form state
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(getTodayISO());
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, filterType]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>("/categories/");
      setCategories(res.data);
    } catch {}
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 15 };
      const now = new Date();
      params.month = now.getMonth() + 1;
      params.year = now.getFullYear();
      if (filterType) params.trx_type = filterType;

      const res = await api.get<TransactionList>("/transactions/", { params });
      setTransactions(res.data.items);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormCategoryId("");
    setFormAmount("");
    setFormDate(getTodayISO());
    setFormNotes("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (trx: Transaction) => {
    setEditingId(trx.id);
    setFormCategoryId(trx.category_id);
    setFormAmount(String(trx.amount));
    setFormDate(trx.trx_date);
    setFormNotes(trx.notes || "");
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const payload = {
        category_id: Number(formCategoryId),
        amount: parseFloat(formAmount),
        trx_date: formDate,
        notes: formNotes || null,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions/", payload);
      }

      setShowModal(false);
      fetchTransactions();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to save transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {}
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {total} transactions this month
          </p>
        </div>
        <div className="flex gap-3">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="select-field"
            style={{ width: 'auto', minWidth: 130 }}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="text-lg mb-1">No transactions found</p>
            <p className="text-sm">Start by adding your first transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id}>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{formatDate(trx.trx_date)}</td>
                    <td className="font-medium">{trx.category.name}</td>
                    <td>
                      <span className={`badge ${trx.category.trx_type === "INCOME" ? "income" : "expense"}`}>
                        {trx.category.trx_type}
                      </span>
                    </td>
                    <td className="font-semibold" style={{
                      color: trx.category.trx_type === "INCOME" ? 'var(--color-income)' : 'var(--color-expense)',
                    }}>
                      {trx.category.trx_type === "INCOME" ? "+" : "-"}{formatCurrency(Number(trx.amount))}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', maxWidth: 200 }}>
                      <span className="truncate block">{trx.notes || "—"}</span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(trx)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                          style={{ color: 'var(--color-accent)' }}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(trx.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          style={{ color: 'var(--color-expense)' }}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Category
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(Number(e.target.value))}
                  className="select-field"
                  required
                >
                  <option value="">Select category...</option>
                  <optgroup label="Income">
                    {categories.filter(c => c.trx_type === "INCOME").map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Expense">
                    {categories.filter(c => c.trx_type === "EXPENSE").map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Amount (IDR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Notes (optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add a note..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                  {editingId ? "Update" : "Add Transaction"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(fullName, email, password, riskProfile);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const riskOptions = [
    {
      value: "Conservative",
      label: "Conservative",
      desc: "Low risk, stable returns",
      icon: "🛡️",
      color: "#10B981",
    },
    {
      value: "Moderate",
      label: "Moderate",
      desc: "Balanced risk and growth",
      icon: "⚖️",
      color: "#3B82F6",
    },
    {
      value: "Aggressive",
      label: "Aggressive",
      desc: "High risk, high potential",
      icon: "🚀",
      color: "#F43F5E",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #0B1121 0%, #1E293B 50%, #0F172A 100%)' }}>
      {/* Decorative orbs */}
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
      <div className="fixed bottom-20 left-20 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Join Finselor
          </h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Start your financial journey today
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Create your account
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="input-field"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {/* Risk Profile Selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Investment Risk Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {riskOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRiskProfile(opt.value)}
                    className="p-3 rounded-xl text-center transition-all duration-200 cursor-pointer"
                    style={{
                      background: riskProfile === opt.value ? `${opt.color}15` : 'var(--color-surface-100)',
                      border: `2px solid ${riskProfile === opt.value ? opt.color : 'var(--color-border)'}`,
                    }}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold" style={{ color: riskProfile === opt.value ? opt.color : 'var(--color-text-primary)' }}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

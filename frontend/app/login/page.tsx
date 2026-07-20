"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0B1121 0%, #1E293B 50%, #0F172A 100%)' }}>
      {/* Decorative orbs */}
      <div className="fixed top-20 left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
      <div className="fixed bottom-20 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Finselor
          </h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Your intelligent financial assistant
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', border: '1px solid var(--color-expense-border)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                id="login-email"
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
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
              {loading ? "Signing in..." : "Sign In"}
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
              Create one
            </Link>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 rounded-lg text-xs text-center" style={{ background: 'var(--color-ai-bg)', border: '1px solid var(--color-ai-border)', color: 'var(--color-text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-ai)' }}>Demo Account:</span>{" "}
            demo@finselor.com / demo1234
          </div>
        </div>
      </div>
    </div>
  );
}

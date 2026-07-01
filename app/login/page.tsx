"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    const ok = await login(email, password);
    if (ok) {
      router.push(ROUTES.onboarding);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 grid-bg relative">
      <div className="absolute top-8 left-8">
        <Link href={ROUTES.home} className="text-body-lg font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-bold text-[11px] uppercase tracking-wider border border-primary/10">
            <span className="material-symbols-outlined text-[14px]">vpn_key</span>
            SECURE ACCESS
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-on-surface tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-on-surface-variant max-w-sm mx-auto">
          Practice mock interviews with AI that remembers your past history.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 border border-outline-variant/30 shadow-2xl rounded-[20px] sm:px-10 ai-glow">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface-variant mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/45"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-on-surface-variant mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/45"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-error-container/30 border border-error/10 text-error rounded-lg flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[14px] shadow-sm text-sm font-semibold text-white bg-primary hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-on-surface-variant/60 font-medium">
                  demo credentials
                </span>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-on-surface-variant/80 space-y-1">
              <p>Email: <span className="font-semibold text-on-surface">user@example.com</span></p>
              <p>Password: <span className="font-semibold text-on-surface">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

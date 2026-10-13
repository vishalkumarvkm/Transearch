"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername("admin@transearch.com");
    setPassword("transearch2025");
    setError("");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0e26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#cca352] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#cca352] text-xs font-semibold tracking-[0.2em] uppercase">
            Verifying Access
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e26] text-white flex flex-col font-sans selection:bg-[#cca352] selection:text-[#0b0e26]">

      {/* ── Header ── */}
      <header className="w-full border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <span className="font-serif font-bold tracking-widest text-white text-base sm:text-lg uppercase select-none">
              TRANSEARCHAI.COM<span className="text-[#cca352]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-[#cca352]" />
            <span className="font-medium tracking-wide">Secure Portal</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-sm">

          {/* Eyebrow */}
          <p className="text-[#cca352] text-[11px] font-semibold tracking-[0.25em] uppercase mb-5 text-center select-none">
            TRANSEARCH INTERNATIONAL
          </p>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white text-center leading-snug mb-2">
            Consultant Portal
          </h1>
          <p className="text-[#8e9eb5] text-xs text-center mb-10 tracking-wide">
            Executive Voice Interaction &amp; Call Audit Access
          </p>

          {/* Divider */}
          <div className="border-t border-slate-800 mb-10" />

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 border border-red-500/30 bg-red-950/20 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <p className="text-red-300 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@transearch.com"
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-[#111736] border border-slate-700 focus:border-[#cca352] text-sm text-white placeholder-slate-500 outline-none transition-colors rounded-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-[#111736] border border-slate-700 focus:border-[#cca352] text-sm text-white placeholder-slate-500 outline-none transition-colors rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#cca352] hover:bg-[#d8b363] active:bg-[#be9747] text-[#0b0e26] font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-none transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#0b0e26] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Access Intelligence Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="border-t border-slate-800 mt-8 mb-6" />

          {/* Demo credentials */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-slate-500 hover:text-[#cca352] transition-colors font-medium tracking-wide cursor-pointer"
            >
              Use default credentials
            </button>
          </div>

          {/* Back link */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors tracking-wide"
            >
              ← Return to Executive Search Portal
            </Link>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-6 px-6 text-center">
        <p className="text-[11px] text-slate-600 tracking-wide">
          © 2026 Transearch International. All rights reserved. &nbsp;·&nbsp; Encrypted &amp; Secure
        </p>
      </footer>

    </div>
  );
}

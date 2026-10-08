"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Lock, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }

      if (data.isPendingDeletion) {
        // Redirect to pending deletion recovery screen
        window.location.href = `/account-pending-deletion?identifier=${encodeURIComponent(identifier)}`;
        return;
      }

      // If administrator, route to /admin, else route to /dashboard
      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoQuickLogin = async (role: "student" | "admin") => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in with demo account.");
      }

      window.location.href = data.redirect || (role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to log in with demo account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign In to CareerOrbit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your verified email or unique User ID to access your preparation roadmap.
          </p>
        </div>

        {/* Hackathon Quick Demo Access Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Hackathon Demo Access</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              One-Click
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Click below to instantly log in with pre-seeded demo accounts without manual typing:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoQuickLogin("student")}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Demo Student
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Enter →</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">student_orbit</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoQuickLogin("admin")}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-500" /> Admin
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Enter →</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">admin_orbit</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium">Or Sign In Manually</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="login-identifier">
              Email Address or User ID
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="login-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student@university.edu or alex_mercer"
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

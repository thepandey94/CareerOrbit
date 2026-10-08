"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function AccountPendingDeletionPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const handleCancelDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/cancel-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel account deletion.");
      }

      setRestored(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error cancelling deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Pending Deletion
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This account is currently in its <strong>14-day grace period</strong>. Normal preparation dashboard access is locked to preserve your account state until permanent erasure or cancellation.
          </p>
        </div>

        {restored ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-3">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold">Account Successfully Restored!</p>
            <p className="text-xs">Your pending deletion has been revoked and all preparation data preserved.</p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Go to Profile Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCancelDeletion} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cancel-identifier">
                Confirm Email or User ID
              </label>
              <input
                id="cancel-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cancel-password">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="cancel-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isLoading ? "Cancelling Deletion..." : "Cancel Deletion & Restore Access"}
            </button>
          </form>
        )}

        <div className="text-xs text-slate-400 pt-2">
          Want to return to the home page?{" "}
          <Link href="/" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

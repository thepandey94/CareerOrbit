"use client";

import React, { useState } from "react";
import { ShieldCheck, Key, User, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminSetupPage() {
  const [setupSecret, setSetupSecret] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("sysadmin");
  const [fullName, setFullName] = useState("System Administrator");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupSecret,
          email,
          userId,
          fullName,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Setup failed.");

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error provisioning administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Initial Admin Provisioning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provision the root administrator account using your securely configured environment setup secret.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Administrator Created Successfully!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Self-provisioning is now closed. Log in with your new credentials.
            </p>
            <a
              href="/login"
              className="inline-block mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-secret">
                Admin Setup Secret
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="admin-secret"
                  type="password"
                  required
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  placeholder="Value from ADMIN_SETUP_SECRET"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-name">
                Full Name
              </label>
              <input
                id="admin-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-email">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@careerorbit.dev"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-userid">
                Admin User ID
              </label>
              <input
                id="admin-userid"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-password">
                Password (min. 12 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  minLength={12}
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
              {isLoading ? "Provisioning..." : "Provision Root Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Users, UserX, Database, Layers, CheckCircle, AlertCircle } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingDeletion: number;
  totalAdmins: number;
  databaseReady: boolean;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Access denied. You must be signed in as an administrator.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-sm font-medium text-slate-500 animate-pulse">Loading administrative portal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full p-6 rounded-2xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Administrator Access Required</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/admin/setup"
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              First-time Setup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" /> Administrative Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Protected management of career tracks, verified question banks, and system metrics.
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Database Connected
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalUsers}</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Students</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats?.activeUsers}</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Deletion (14-day)</span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.pendingDeletion}</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Administrators</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalAdmins}</p>
        </div>
      </div>

      {/* Curriculum Management Overview */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Curriculum & Question Bank Modules
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          In Phase 2 and Phase 3, this administrative interface will allow approving, editing, or rejecting AI-generated diagnostic and assessment questions before they enter the active student question bank.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Software Engineer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Java, Python, C++, DSA, Software Design</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-blue-600 dark:text-blue-400">Ready for Phase 2 Seed</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Web Developer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">HTML5, CSS3, JavaScript, Web Architecture</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Ready for Phase 2 Seed</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Data Analyst</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SQL, Python, Analytics, Data Modeling</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400">Ready for Phase 2 Seed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

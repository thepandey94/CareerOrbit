"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  BookOpen,
  PieChart,
} from "lucide-react";

interface AptitudeOverviewData {
  totalAttempts: number;
  passedAttempts: number;
  bestScore: number;
  latestAttempt: {
    id: string;
    level: number;
    score: number;
    totalQuestions: number;
    passed: boolean;
    status: string;
    submittedAt: string | null;
  } | null;
  structure: {
    totalQuestions: number;
    durationMinutes: number;
    passingThresholdScore: number;
    passingThresholdPercent: number;
    distribution: Array<{
      section: string;
      count: number;
      topics: string;
    }>;
  };
}

export default function AptitudeOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<AptitudeOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch("/api/aptitude/overview");
        if (res.status === 401) {
          router.push("/login?redirect=/aptitude");
          return;
        }
        if (!res.ok) throw new Error("Failed to load aptitude module.");
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading aptitude overview.");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [router]);

  async function handleStartAptitude() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/aptitude/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: 1 }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to start aptitude attempt.");
      }
      const json = await res.json();
      router.push(`/aptitude/${json.attemptId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error starting assessment.");
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Aptitude Assessment Module...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl border border-blue-700/40">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-wide uppercase border border-blue-400/30">
              <Brain className="w-4 h-4" /> Comprehensive Aptitude Evaluation
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">General Aptitude Assessment</h1>
            <p className="text-blue-200 text-sm max-w-2xl leading-relaxed">
              Standardized campus placement aptitude evaluation consisting of 25 timed questions: 10 Quantitative Aptitude, 8 Logical Reasoning, and 7 Verbal Ability problems. Equal marks per question, no negative marking, and automatic submission on timeout.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-blue-700/40">
            <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/40">
              <span className="text-xs text-blue-300 font-medium block">Total Questions</span>
              <span className="text-xl font-bold text-white">25 Questions</span>
            </div>
            <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/40">
              <span className="text-xs text-blue-300 font-medium block">Time Limit</span>
              <span className="text-xl font-bold text-white">45 Minutes</span>
            </div>
            <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/40">
              <span className="text-xs text-blue-300 font-medium block">Passing Threshold</span>
              <span className="text-xl font-bold text-emerald-400">60% (15/25)</span>
            </div>
            <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/40">
              <span className="text-xs text-blue-300 font-medium block">Scoring Policy</span>
              <span className="text-xl font-bold text-white">Equal / No Negative</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Section Distribution Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Section Breakdown (25 Questions)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data?.structure?.distribution || []).map((sec, idx) => (
              <div
                key={sec.section}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    Section {idx + 1}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {sec.count} Questions
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {sec.section}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sec.topics}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Assessment Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Ready to begin your Aptitude Round?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Once you start, a 45-minute countdown timer will begin. Answer all 25 questions and review your performance breakdown across Quantitative, Logical, and Verbal topics.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Total Attempts: <strong>{data?.totalAttempts || 0}</strong></span>
              <span>•</span>
              <span>Best Score: <strong>{data?.bestScore || 0}/25 ({Math.round(((data?.bestScore || 0) / 25) * 100)}%)</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartAptitude}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex-shrink-0"
          >
            {starting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                {data && data.totalAttempts > 0 ? "Take Fresh Aptitude Round" : "Start Aptitude Round"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

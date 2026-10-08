"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Terminal,
} from "lucide-react";

interface AttemptOverview {
  id: string;
  level: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  submittedAt: string | null;
}

interface TechnicalOverview {
  track: string;
  totalAttempts: number;
  passedAttempts: number;
  bestScore: number;
  latestAttempt: AttemptOverview | null;
  levels: Array<{
    level: number;
    title: string;
    description: string;
    passed: boolean;
    attemptsCount: number;
    bestScore: number;
  }>;
}

export default function TechnicalOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<TechnicalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch("/api/technical/overview");
        if (res.status === 401) {
          router.push("/login?redirect=/technical");
          return;
        }
        if (!res.ok) throw new Error("Failed to load technical round status.");
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load overview.");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [router]);

  async function handleStartAssessment(level: number) {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/technical/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to start assessment.");
      }
      const json = await res.json();
      router.push(`/technical/${json.attemptId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error starting assessment.");
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Technical Assessment Round...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-8 shadow-xl border border-indigo-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-400/30">
                <Code2 className="w-4 h-4" /> Official Technical Assessment
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Technical Interview Round</h1>
              <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                Evaluates your real programming competencies through 25 timed questions: 15 conceptual knowledge questions, 5 debugging/code-output challenges, and 5 hands-on algorithmic coding problems executed in an isolated sandbox.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <Terminal className="w-4 h-4 text-emerald-400" /> Open Code Playground
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-700/50">
            <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
              <span className="text-xs text-indigo-300 font-medium block">Total Questions</span>
              <span className="text-xl font-bold text-white">25 Questions</span>
            </div>
            <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
              <span className="text-xs text-indigo-300 font-medium block">Time Limit</span>
              <span className="text-xl font-bold text-white">60 Minutes</span>
            </div>
            <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
              <span className="text-xs text-indigo-300 font-medium block">Passing Threshold</span>
              <span className="text-xl font-bold text-emerald-400">60% (15/25)</span>
            </div>
            <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
              <span className="text-xs text-indigo-300 font-medium block">Scoring Policy</span>
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

        {/* Level Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Assessment Levels
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {(data?.levels || []).map((lvl) => (
              <div
                key={lvl.level}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      LEVEL {lvl.level}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {lvl.title}
                    </h3>
                    {lvl.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : lvl.attemptsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        <RotateCcw className="w-3.5 h-3.5" /> In Progress
                      </span>
                    ) : null}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {lvl.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Attempts: <strong className="text-slate-700 dark:text-slate-300">{lvl.attemptsCount}</strong></span>
                    <span>•</span>
                    <span>Best Score: <strong className="text-slate-700 dark:text-slate-300">{lvl.bestScore}/25 ({Math.round((lvl.bestScore / 25) * 100)}%)</strong></span>
                    <span>•</span>
                    <span>Passing: <strong className="text-emerald-600 dark:text-emerald-400">15/25 (60%)</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleStartAssessment(lvl.level)}
                    disabled={starting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {starting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        {lvl.attemptsCount > 0 ? "Take Assessment Again" : "Start Assessment"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Assessment Rules Card */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Assessment Rules & Integrity Protocol
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span><strong>Timed 60-Minute Window:</strong> Once initialized, the timer runs continuously. Assessments auto-submit on timeout.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span><strong>Hidden Test Case Protection:</strong> Coding problems test cases are kept strictly private on the server to prevent hardcoding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span><strong>Supported Languages:</strong> Coding questions officially support <strong>Java</strong> and <strong>Python</strong> evaluated in isolated sandbox environments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span><strong>Unlimited Retakes:</strong> If you score below 60%, complete topic-level revision and attempt a fresh assessment of equivalent difficulty.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

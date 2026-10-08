"use client";

import React, { Suspense, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PieChart,
} from "lucide-react";

interface CategoryBreakdown {
  category: "QUANTITATIVE" | "LOGICAL" | "VERBAL";
  total: number;
  earned: number;
  percentage: number;
}

interface AptitudeReviewItem {
  id: string;
  topic: string;
  category: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  studentSelectedOption?: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  earnedScore: number;
  solutionExplanation: string;
}

interface AptitudeResultData {
  attemptId: string;
  level: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  status: string;
  passingThresholdScore: number;
  passingThresholdPercent: number;
  categoryBreakdown: CategoryBreakdown[];
  weakTopics: string[];
  questionReviews: AptitudeReviewItem[];
}

function AptitudeResultInner(props: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(props.params);
  const router = useRouter();
  const [data, setData] = useState<AptitudeResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/aptitude/result/${attemptId}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/aptitude/result/${attemptId}`);
          return;
        }
        if (!res.ok) throw new Error("Failed to load aptitude result.");
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading result.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Grading Aptitude Round...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Result Error</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error || "Could not retrieve score."}</p>
          <Link
            href="/aptitude"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            Back to Aptitude Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Score Banner */}
        <div className={`rounded-2xl p-8 border shadow-lg ${
          data.passed
            ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border-emerald-500/40 text-white"
            : "bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 border-amber-500/40 text-white"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border">
                {data.passed ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Aptitude Threshold Cleared
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" /> Revision Recommended
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {data.passed ? "Well Done! Aptitude Assessment Passed" : "Needs Practice: Aptitude Round"}
              </h1>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                {data.passed
                  ? "You demonstrated strong general problem-solving ability across quantitative arithmetic, logical deduction, and verbal communication."
                  : "You scored below the 60% passing mark. Identify your weaker sections below and retake a fresh assessment."}
              </p>
            </div>

            {/* Score Metric Dial */}
            <div className="flex items-center gap-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex-shrink-0">
              <div className="text-center">
                <span className="text-4xl font-black text-white">{data.score}</span>
                <span className="text-lg text-slate-400">/{data.totalQuestions}</span>
                <span className="block text-xs text-slate-400 mt-1">Marks Earned</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className={`text-3xl font-extrabold ${data.passed ? "text-emerald-400" : "text-amber-400"}`}>
                  {data.percentage}%
                </span>
                <span className="block text-xs text-slate-400 mt-1">Pass Mark: 60%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-800">
            <Link
              href="/aptitude"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" /> Retake Fresh Assessment
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
            >
              Return to Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Category Breakdown (Quant, Logical, Verbal) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Section Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.categoryBreakdown.map((cat) => {
              const isPassed = cat.percentage >= 60;
              return (
                <div
                  key={cat.category}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase">{cat.category}</span>
                    <span className={isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                      {cat.earned} / {cat.total} ({cat.percentage}%)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {cat.category === "QUANTITATIVE" ? "Quantitative Aptitude" : cat.category === "LOGICAL" ? "Logical Reasoning" : "Verbal Ability"}
                  </h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPassed ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Topics Diagnostic Alert */}
        {data.weakTopics.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Recommended Topics for Targeted Revision</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
              You scored under 60% in:{" "}
              <strong>{data.weakTopics.map((t) => t.replace(/_/g, " ")).join(", ")}</strong>. Review the solution explanations below.
            </p>
          </div>
        )}

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Comprehensive Question Review & Solutions (25 Questions)
          </h2>

          <div className="space-y-3">
            {data.questionReviews.map((q, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {q.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Q{idx + 1}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            {q.category}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {q.topic.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                          {q.prompt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-bold ${q.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                        {q.earnedScore} / 1 Mark
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded Solution View */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 text-sm">
                      <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                        {q.prompt}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isCorrectOpt = opt.id === q.correctOptionId;
                          const isStudentOpt = opt.id === q.studentSelectedOption;

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                isCorrectOpt
                                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                                  : isStudentOpt
                                  ? "bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200"
                                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span>{opt.text}</span>
                              {isCorrectOpt && <span className="font-bold text-emerald-600">✓ Correct Answer</span>}
                              {isStudentOpt && !isCorrectOpt && <span className="font-bold text-rose-600">✕ Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-xl p-4 text-xs space-y-1">
                        <strong className="text-indigo-900 dark:text-indigo-300 block">
                          Step-by-Step Solution & Working:
                        </strong>
                        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                          {q.solutionExplanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AptitudeResultPage(props: { params: Promise<{ attemptId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading Results...</p>
        </div>
      }
    >
      <AptitudeResultInner params={props.params} />
    </Suspense>
  );
}

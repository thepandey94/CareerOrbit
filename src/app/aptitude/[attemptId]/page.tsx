"use client";

import React, { Suspense, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Brain,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface AptitudeQuestionItem {
  id: string;
  topic: string;
  category: "QUANTITATIVE" | "LOGICAL" | "VERBAL";
  difficulty: string;
  prompt: string;
  options: QuestionOption[];
}

interface AptitudeAttemptData {
  attemptId: string;
  level: number;
  totalQuestions: number;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  passingThresholdPercent: number;
  questions: AptitudeQuestionItem[];
}

function AptitudeExamInner(props: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(props.params);
  const router = useRouter();
  const [data, setData] = useState<AptitudeAttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected answers: questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(2700); // 45 mins
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/aptitude/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: 1 }),
        });
        if (res.status === 401) {
          router.push(`/login?redirect=/aptitude/${attemptId}`);
          return;
        }
        if (!res.ok) throw new Error("Failed to load aptitude questions.");
        const json: AptitudeAttemptData = await res.json();
        setData(json);

        const expiry = new Date(json.expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setSecondsRemaining(diff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading aptitude assessment.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [attemptId, router]);

  // Countdown timer with auto-submit
  useEffect(() => {
    if (loading || isSubmitting) return;

    if (secondsRemaining <= 0) {
      handleFinalSubmit(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, loading, isSubmitting]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleFinalSubmit = async (isAutoExpire = false) => {
    if (isSubmitting) return;
    if (!isAutoExpire) {
      const count = Object.keys(answers).length;
      if (!confirm(`You have answered ${count} of 25 aptitude questions. Ready to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await fetch("/api/aptitude/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: formatted,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Submission failed.");
      }

      router.push(`/aptitude/result/${attemptId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting aptitude answers.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Aptitude Examination...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assessment Error</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error || "Could not load test."}</p>
          <button
            onClick={() => router.push("/aptitude")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            Back to Aptitude Overview
          </button>
        </div>
      </div>
    );
  }

  const currentQ = data.questions[currentIndex];
  const selectedOpt = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
              Aptitude Round (25 Qs)
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              Question {currentIndex + 1} of {data.totalQuestions}
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
            secondsRemaining < 300
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-300 animate-pulse"
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Finish Assessment
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Metadata Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {currentQ.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {currentQ.topic.replace(/_/g, " ")}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400">
                1 Mark • No Negative Marking
              </span>
            </div>

            {/* Question Prompt */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                {currentQ.prompt}
              </h2>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOpt === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500 shadow-xs"
                        : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`apt_${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(currentQ.id, opt.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {opt.text}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(data.totalQuestions - 1, prev + 1))}
                disabled={currentIndex === data.totalQuestions - 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-30"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: 25-Question Palette */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Question Palette (25)
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      isCurrent
                        ? "ring-2 ring-indigo-500 bg-indigo-600 text-white"
                        : isAnswered
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AptitudeExamPage(props: { params: Promise<{ attemptId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Preparing Aptitude Assessment...</p>
        </div>
      }
    >
      <AptitudeExamInner params={props.params} />
    </Suspense>
  );
}

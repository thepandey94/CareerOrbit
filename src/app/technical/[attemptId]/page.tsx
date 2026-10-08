"use client";

import React, { Suspense, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Code2,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Terminal,
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface SampleTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

interface QuestionItem {
  id: string;
  topic: string;
  questionType: "CONCEPTUAL" | "CODE_OUTPUT" | "DEBUGGING" | "CODING_PROBLEM";
  difficulty: string;
  prompt: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  starterCode?: {
    python: string;
    java: string;
  };
  sampleTestCases?: SampleTestCase[];
}

interface AttemptData {
  attemptId: string;
  track: string;
  level: number;
  totalQuestions: number;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  passingThresholdPercent: number;
  questions: QuestionItem[];
}

interface StudentAnswerState {
  selectedOptionId?: string;
  submittedCode?: string;
  language?: "python" | "java";
}

function TechnicalExamInner(props: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(props.params);
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers map: questionId -> answer
  const [answers, setAnswers] = useState<Record<string, StudentAnswerState>>({});

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trial code run state for coding questions
  const [trialRunning, setTrialRunning] = useState(false);
  const [trialResult, setTrialResult] = useState<{
    allPassed: boolean;
    passedTests: number;
    totalTests: number;
    testResults: Array<{
      testCaseId: string;
      passed: boolean;
      input?: string;
      expectedOutput?: string;
      actualOutput?: string;
      error?: string;
    }>;
  } | null>(null);

  // Fetch assessment questions
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/technical/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: 1 }),
        });
        if (res.status === 401) {
          router.push(`/login?redirect=/technical/${attemptId}`);
          return;
        }
        if (!res.ok) throw new Error("Failed to load technical assessment.");
        const json: AttemptData = await res.json();
        setData(json);

        // Calculate initial remaining seconds
        const expiry = new Date(json.expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setSecondsRemaining(diff);

        // Prepopulate starter codes for coding questions
        const initialAnswers: Record<string, StudentAnswerState> = {};
        json.questions.forEach((q) => {
          if (q.questionType === "CODING_PROBLEM") {
            initialAnswers[q.id] = {
              language: "python",
              submittedCode: q.starterCode?.python || "# Write your Python solution here\n",
            };
          }
        });
        setAnswers(initialAnswers);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading assessment.");
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

  // Format MM:SS
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Multiple-choice select
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  // Coding problem language change
  const handleLanguageChange = (questionId: string, lang: "python" | "java", q: QuestionItem) => {
    const defaultCode = lang === "python"
      ? (q.starterCode?.python || "# Write Python code\n")
      : (q.starterCode?.java || "// Write Java code\n");

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        language: lang,
        submittedCode: defaultCode,
      },
    }));
    setTrialResult(null);
  };

  // Coding problem code text change
  const handleCodeChange = (questionId: string, code: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        submittedCode: code,
      },
    }));
  };

  // Reset starter code
  const handleResetCode = (questionId: string, q: QuestionItem) => {
    const lang = answers[questionId]?.language || "python";
    const starter = lang === "python" ? q.starterCode?.python : q.starterCode?.java;
    if (starter) {
      handleCodeChange(questionId, starter);
      setTrialResult(null);
    }
  };

  // Run sample test cases (trial execution)
  const handleRunSampleTests = async (questionId: string) => {
    const currentAns = answers[questionId];
    if (!currentAns?.submittedCode) return;

    setTrialRunning(true);
    setTrialResult(null);
    try {
      const res = await fetch("/api/technical/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId,
          code: currentAns.submittedCode,
          language: currentAns.language || "python",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Execution failed.");
      }

      const json = await res.json();
      setTrialResult(json);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to execute test cases.");
    } finally {
      setTrialRunning(false);
    }
  };

  // Final Assessment Submission
  const handleFinalSubmit = async (isAutoExpire = false) => {
    if (isSubmitting) return;
    if (!isAutoExpire) {
      const answeredCount = Object.values(answers).filter(
        (a) => a.selectedOptionId || (a.submittedCode && a.submittedCode.trim().length > 30)
      ).length;
      const confirmMsg = `You have answered ${answeredCount} of 25 questions. Are you ready to submit your assessment for official grading?`;
      if (!confirm(confirmMsg)) return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        selectedOptionId: ans.selectedOptionId,
        submittedCode: ans.submittedCode,
        language: ans.language,
      }));

      const res = await fetch("/api/technical/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Submission failed.");
      }

      router.push(`/technical/result/${attemptId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting assessment.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Assessment Questions...</p>
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
            onClick={() => router.push("/technical")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            Return to Technical Overview
          </button>
        </div>
      </div>
    );
  }

  const currentQ = data.questions[currentIndex];
  const currentAnswer = answers[currentQ.id] || {};
  const isCoding = currentQ.questionType === "CODING_PROBLEM";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Examination Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              Level {data.level} Technical Round
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              Question {currentIndex + 1} of {data.totalQuestions}
            </span>
          </div>

          {/* Countdown Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
            secondsRemaining < 300
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-300 animate-pulse"
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
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
        {/* Left 3 Columns: Active Question Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentQ.topic}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {currentQ.questionType.replace("_", " ")}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400">
                1 Mark • No Negative Marking
              </span>
            </div>

            {/* Prompt */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                {currentQ.prompt}
              </h2>

              {currentQ.codeSnippet && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}
            </div>

            {/* Question Workspace: Multiple Choice vs. Coding Problem */}
            {!isCoding ? (
              /* Multiple Choice Options */
              <div className="space-y-3 pt-2">
                {(currentQ.options || []).map((opt) => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500 shadow-sm"
                          : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQ.id}`}
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
            ) : (
              /* Coding Problem Workspace */
              <div className="space-y-4 pt-2">
                {/* Language Toolbar & Reset */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language:</span>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange(currentQ.id, "python", currentQ)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        (currentAnswer.language || "python") === "python"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      Python 3.10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange(currentQ.id, "java", currentQ)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        currentAnswer.language === "java"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      Java (JDK 15)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetCode(currentQ.id, currentQ)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Starter Code
                  </button>
                </div>

                {/* Monospace Code Editor */}
                <div className="relative">
                  <textarea
                    value={currentAnswer.submittedCode || ""}
                    onChange={(e) => handleCodeChange(currentQ.id, e.target.value)}
                    rows={12}
                    className="w-full font-mono text-xs sm:text-sm bg-slate-950 text-emerald-300 p-4 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 leading-relaxed resize-y"
                    placeholder="Write code here..."
                    spellCheck={false}
                  />
                </div>

                {/* Sample Test Cases & Run Button */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Sample Test Cases (Visible)
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRunSampleTests(currentQ.id)}
                      disabled={trialRunning}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      {trialRunning ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Executing in Sandbox...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          Run Sample Tests
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sample Test Cases Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(currentQ.sampleTestCases || []).map((tc, idx) => (
                      <div key={tc.id} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                        <span className="text-slate-500 font-semibold block">Sample {idx + 1}:</span>
                        <div><strong className="text-slate-400">Input:</strong> <span className="text-slate-800 dark:text-slate-200">{tc.input}</span></div>
                        <div><strong className="text-slate-400">Expected:</strong> <span className="text-slate-800 dark:text-slate-200">{tc.expectedOutput}</span></div>
                      </div>
                    ))}
                  </div>

                  {/* Trial Execution Output Console */}
                  {trialResult && (
                    <div className="mt-3 bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Sandbox Trial Results
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          trialResult.allPassed ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"
                        }`}>
                          {trialResult.passedTests} / {trialResult.totalTests} Sample Tests Passed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {trialResult.testResults.map((tr, i) => (
                          <div key={tr.testCaseId} className="space-y-1 border-b border-slate-800/50 pb-2 last:border-0">
                            <div className="flex items-center gap-2">
                              {tr.passed ? (
                                <span className="text-emerald-400 font-bold">✓ Sample {i + 1} Passed</span>
                              ) : (
                                <span className="text-rose-400 font-bold">✕ Sample {i + 1} Failed</span>
                              )}
                            </div>
                            {tr.input && <div><span className="text-slate-500">Input: </span><span className="text-slate-300">{tr.input}</span></div>}
                            {tr.actualOutput && <div><span className="text-slate-500">Your Output: </span><span className="text-slate-200">{tr.actualOutput}</span></div>}
                            {tr.error && <div><span className="text-rose-400">Error: </span><span className="text-rose-300">{tr.error}</span></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                  setTrialResult(null);
                }}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentIndex((prev) => Math.min(data.totalQuestions - 1, prev + 1));
                  setTrialResult(null);
                }}
                disabled={currentIndex === data.totalQuestions - 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-30"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Grid Palette */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Question Palette (25)
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = ans && (ans.selectedOptionId || (ans.submittedCode && ans.submittedCode.trim().length > 30));
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setTrialResult(null);
                    }}
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

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span>Current Question</span>
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

export default function TechnicalExamPage(props: { params: Promise<{ attemptId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Preparing Assessment Environment...</p>
        </div>
      }
    >
      <TechnicalExamInner params={props.params} />
    </Suspense>
  );
}

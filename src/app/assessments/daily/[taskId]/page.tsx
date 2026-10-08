"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Bot,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import AiTutorDrawer from "@/components/AiTutorDrawer";

function DailyAssessmentContent({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // 20-minute countdown timer in seconds (1200s)
  const [secondsRemaining, setSecondsRemaining] = useState(1200);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch(`/api/assessments/daily/${taskId}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/assessments/daily/${taskId}`);
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load assessment.");
        }

        setAssessmentData(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [taskId, router]);

  // Countdown timer
  useEffect(() => {
    if (results || loading) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(); // Auto-submit when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [results, loading]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionArray = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await fetch(`/api/assessments/daily/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions: submissionArray }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit assessment.");
      }

      setResults(data);
    } catch (err: any) {
      alert(err.message || "Failed to grade assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResults(null);
    setSecondsRemaining(1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Preparing daily knowledge check...</p>
      </div>
    );
  }

  if (errorMsg || !assessmentData) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold">Assessment Unavailable</h2>
        <p className="text-sm text-zinc-500 mt-2">{errorMsg || "Assessment could not be loaded."}</p>
        <Link
          href="/roadmap"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Roadmap
          </Link>

          <button
            onClick={() => setIsTutorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 text-xs font-bold transition"
          >
            <Bot className="w-4 h-4" /> Consult AI Study Tutor
          </button>
        </div>

        {/* Assessment Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                Day {assessmentData.dayNumber} Knowledge Check
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {assessmentData.title}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Passing Threshold: {assessmentData.passingScorePercentage}% (At least 3 of 5 correct)
              </p>
            </div>

            {/* Countdown Badge */}
            {!results && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}
          </div>

          {/* ================= RESULTS VIEW ================= */}
          {results ? (
            <div className="space-y-6">
              {/* Score Banner */}
              <div
                className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  results.passed
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-900 dark:text-amber-100"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {results.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    )}
                    <h2 className="text-xl font-bold">
                      {results.passed ? "Assessment Passed!" : "Assessment Incomplete"}
                    </h2>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {results.revisionRecommendation}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-3xl font-extrabold">{results.score}%</span>
                  <span className="text-[11px] opacity-75">
                    {results.correctCount} of {results.totalQuestions} Correct
                  </span>
                </div>
              </div>

              {/* Attempt Stats */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-500 block">First Score</span>
                  <span className="font-bold text-sm">{results.firstScore}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Latest Score</span>
                  <span className="font-bold text-sm">{results.latestScore}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Best Score</span>
                  <span className="font-bold text-sm text-emerald-600">{results.bestScore}%</span>
                </div>
              </div>

              {/* Weak Topics If Failed */}
              {!results.passed && results.weakTopics.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    Recommended Targeted Revision:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                    {results.weakTopics.map((topic: string, i: number) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Question-by-Question Review */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">
                  Detailed Solution Review
                </h3>

                {results.reviewItems.map((item: any, idx: number) => (
                  <div
                    key={item.questionId}
                    className={`p-4 rounded-2xl border space-y-2 text-xs ${
                      item.isCorrect
                        ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/20"
                        : "bg-red-50/20 dark:bg-red-950/10 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        Question {idx + 1}
                      </span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          item.isCorrect ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{item.prompt}</p>

                    <div className="space-y-1 pt-1 text-zinc-600 dark:text-zinc-400">
                      <div>
                        <strong>Your Answer:</strong> {item.userAnswer}
                      </div>
                      {!item.isCorrect && (
                        <div className="text-emerald-600 dark:text-emerald-400">
                          <strong>Correct Answer:</strong> {item.correctAnswer}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-zinc-500 leading-relaxed">
                      <strong>Explanation:</strong> {item.explanation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Assessment
                </button>

                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md"
                >
                  {results.passed ? "Continue to Next Module" : "Return to Roadmap"}
                </Link>
              </div>
            </div>
          ) : (
            /* ================= ACTIVE QUESTIONS FORM ================= */
            <div className="space-y-6">
              {assessmentData.questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                >
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    Question {idx + 1} of {assessmentData.questions.length}
                  </div>

                  <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                    {q.prompt}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt: any) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          selectedAnswers[q.id] === opt.id
                            ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`assess_${q.id}`}
                          checked={selectedAnswers[q.id] === opt.id}
                          onChange={() =>
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [q.id]: opt.id,
                            })
                          }
                          className="mt-0.5 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs leading-relaxed">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {Object.keys(selectedAnswers).length} of {assessmentData.questions.length} answered
                </span>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md"
                >
                  {isSubmitting ? "Grading..." : "Submit Assessment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Study Tutor Drawer */}
      <AiTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        topic={assessmentData?.title}
        isActiveAssessment={!results}
      />
    </div>
  );
}

export default function DailyAssessmentPage(props: {
  params: Promise<{ taskId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading daily assessment...</p>
        </div>
      }
    >
      <DailyAssessmentContent params={props.params} />
    </Suspense>
  );
}

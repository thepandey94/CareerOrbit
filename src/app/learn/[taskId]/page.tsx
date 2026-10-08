"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  ExternalLink,
  Bot,
  Code2,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import AiTutorDrawer from "@/components/AiTutorDrawer";

function LearnTaskContent({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [newlyUnlockedCount, setNewlyUnlockedCount] = useState(0);

  useEffect(() => {
    async function loadTask() {
      try {
        const res = await fetch(`/api/roadmap/task/${taskId}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/learn/${taskId}`);
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load task.");
        }

        setTaskDetails(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load task.");
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId, router]);

  const handleCompleteTask = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/roadmap/task/${taskId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete task.");
      }

      setCompletionSuccess(true);
      setNewlyUnlockedCount(data.newlyUnlockedTaskIds?.length || 0);
      setTaskDetails((prev: any) => ({
        ...prev,
        task: { ...prev.task, status: "COMPLETED" },
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading learning module...</p>
      </div>
    );
  }

  if (errorMsg || !taskDetails) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold">Task Unavailable</h2>
        <p className="text-sm text-zinc-500 mt-2">{errorMsg || "Task could not be found."}</p>
        <Link
          href="/roadmap"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const { task, isUnlocked, lockReason, track, curriculumDay } = taskDetails;
  const isCompleted = task.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <Bot className="w-4 h-4" /> Ask AI Study Tutor
          </button>
        </div>

        {/* Lock Banner if task is locked */}
        {!isUnlocked && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
            <Lock className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong>This task is currently locked:</strong>
              <p className="mt-0.5">{lockReason || "Complete earlier prerequisite tasks to unlock."}</p>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Week {task.weekNumber} • Day {task.dayNumber}
              </span>
              <span className="flex items-center gap-1 text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                {task.durationMinutes} Minutes Target
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {task.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          </div>

          {/* In-App Learning Explanation */}
          {curriculumDay?.learning?.inAppContent && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Core Concept Breakdown
              </h2>
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/40 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 font-sans">
                {curriculumDay.learning.inAppContent}
              </div>
            </div>
          )}

          {/* Guided Exercises if Practice Task */}
          {task.taskType === "PRACTICE" && curriculumDay?.practice && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                Hands-On Practice Exercises
              </h2>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {curriculumDay.practice.exercises.map((ex: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>

                {curriculumDay.practice.starterCode && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Starter Exercise Code:
                    </span>
                    <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 text-xs overflow-x-auto font-mono">
                      <code>{curriculumDay.practice.starterCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verified Curated Resources Section */}
          {task.resources && task.resources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-600" />
                Verified External Learning Resources
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.resources.map((res: any) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Verified Reference
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase">
                          {res.resourceType}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 transition">
                        {res.title}
                      </h4>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 transition shrink-0 ml-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Completion Banner or Action Button */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {completionSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Module Completed! {newlyUnlockedCount > 0 ? `${newlyUnlockedCount} downstream task(s) unlocked.` : ""}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isCompleted ? (
                <button
                  onClick={handleCompleteTask}
                  disabled={!isUnlocked || isCompleting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition"
                >
                  {isCompleting ? "Saving Progress..." : "Mark Module as Completed"}
                </button>
              ) : (
                <Link
                  href="/roadmap"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-sm transition text-center"
                >
                  Continue on Roadmap
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Study Tutor Drawer */}
      <AiTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        track={track}
        topic={curriculumDay?.dayTitle || task.title}
        inAppContentContext={curriculumDay?.learning?.inAppContent}
      />
    </div>
  );
}

export default function LearnTaskPage(props: {
  params: Promise<{ taskId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading learning module...</p>
        </div>
      }
    >
      <LearnTaskContent params={props.params} />
    </Suspense>
  );
}

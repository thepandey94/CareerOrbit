"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  BookOpen,
  Code,
  Award,
  Bot,
  AlertCircle,
  Sparkles,
  Calendar,
  ExternalLink,
} from "lucide-react";
import AiTutorDrawer from "@/components/AiTutorDrawer";
import { CAREER_TRACKS } from "@/lib/onboarding/tracks";

export default function RoadmapDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [activeTutorTopic, setActiveTutorTopic] = useState("Software Engineering Fundamentals");

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await fetch("/api/roadmap");
        if (res.status === 401) {
          router.push("/login?redirect=/roadmap");
          return;
        }

        const data = await res.json();
        if (!data.hasRoadmap) {
          router.push(data.redirectUrl || "/onboarding");
          return;
        }

        setRoadmapData(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load roadmap.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmap();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Compass className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Unable to load roadmap</h2>
        <p className="text-sm text-zinc-500 mt-2">{errorMsg}</p>
        <Link
          href="/onboarding"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Career Onboarding
        </Link>
      </div>
    );
  }

  const { profile, roadmap } = roadmapData;
  const trackInfo = CAREER_TRACKS[profile.selectedTrack as keyof typeof CAREER_TRACKS];

  // Group tasks by week and day
  const weeksMap: Record<number, Record<number, any[]>> = {};
  roadmap.tasks.forEach((t: any) => {
    if (!weeksMap[t.weekNumber]) weeksMap[t.weekNumber] = {};
    if (!weeksMap[t.weekNumber][t.dayNumber]) weeksMap[t.weekNumber][t.dayNumber] = [];
    weeksMap[t.weekNumber][t.dayNumber].push(t);
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              Active Career Track: {trackInfo?.title || profile.selectedTrack}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {roadmap.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Target Pace: 90 Minutes/Day • Timeline: {profile.targetWeeks} Weeks
              {profile.targetDate && ` • Target Date: ${new Date(profile.targetDate).toLocaleDateString()}`}
            </p>
          </div>

          {/* Progress Widget */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-zinc-600 dark:text-zinc-400">Roadmap Progress</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {roadmap.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmap.progressPercentage}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] text-zinc-500">
              <span>{roadmap.completedTasks} Tasks Done</span>
              <span>{roadmap.totalTasks} Total Tasks</span>
            </div>
          </div>
        </div>

        {/* Floating AI Tutor Callout Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setActiveTutorTopic(trackInfo?.title || "Computer Science Fundamentals");
              setIsTutorOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
          >
            <Bot className="w-4 h-4" />
            <span>Consult AI Study Tutor</span>
          </button>
        </div>

        {/* Modules Breakdown by Weeks and Days */}
        <div className="space-y-8">
          {Object.entries(weeksMap).map(([weekNum, daysObj]) => (
            <div
              key={weekNum}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Curriculum Stage
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Week {weekNum}: Foundational Core
                  </h2>
                </div>
              </div>

              {/* Days Grid */}
              <div className="space-y-6">
                {Object.entries(daysObj).map(([dayNum, tasks]) => (
                  <div
                    key={dayNum}
                    className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          D{dayNum}
                        </span>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                          Day {dayNum} Modules (90 Minutes Daily Target)
                        </h3>
                      </div>
                    </div>

                    {/* Task Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tasks.map((task: any) => {
                        const isCompleted = task.status === "COMPLETED";
                        const isAvailable = task.status === "AVAILABLE";
                        const isLocked = task.status === "LOCKED";

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                              isCompleted
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30"
                                : isAvailable
                                ? "bg-white dark:bg-zinc-900 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20"
                                : "bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-80"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="flex items-center gap-1 font-semibold text-zinc-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  {task.durationMinutes} mins
                                </span>

                                {isCompleted && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                  </span>
                                )}
                                {isAvailable && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                                    Available Now
                                  </span>
                                )}
                                {isLocked && (
                                  <span className="flex items-center gap-1 text-zinc-500 font-bold text-[11px]">
                                    <Lock className="w-3.5 h-3.5" /> Locked
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mb-1.5">
                                {task.taskType === "LEARNING" && (
                                  <BookOpen className="w-4 h-4 text-blue-500" />
                                )}
                                {task.taskType === "PRACTICE" && (
                                  <Code className="w-4 h-4 text-emerald-500" />
                                )}
                                {task.taskType === "ASSESSMENT" && (
                                  <Award className="w-4 h-4 text-purple-500" />
                                )}
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                  {task.taskType}
                                </span>
                              </div>

                              <h4 className="font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2">
                                {task.title}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            </div>

                            {/* Prerequisite Lock Reason */}
                            {isLocked && task.lockReason && (
                              <div className="mt-3 p-2 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                                <Lock className="w-3.5 h-3.5 shrink-0 text-zinc-500 mt-0.5" />
                                <span>{task.lockReason}</span>
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                              {task.taskType === "ASSESSMENT" ? (
                                <Link
                                  href={`/assessments/daily/${task.id}`}
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                                    isLocked
                                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed pointer-events-none"
                                      : isCompleted
                                      ? "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                  }`}
                                >
                                  {isCompleted ? "Retake Assessment" : "Take Assessment"}
                                </Link>
                              ) : (
                                <Link
                                  href={`/learn/${task.id}`}
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                                    isLocked
                                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed pointer-events-none"
                                      : isCompleted
                                      ? "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                  }`}
                                >
                                  {isCompleted ? "Review Content" : "Start Module"}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Study Tutor Drawer */}
      <AiTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        track={profile.selectedTrack}
        topic={activeTutorTopic}
      />
    </div>
  );
}

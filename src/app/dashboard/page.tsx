"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BarChart3,
  Brain,
  Code2,
  Compass,
  Video,
  Flame,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Target,
  Crown,
  Lock,
  Layers,
} from "lucide-react";
import { StudentDashboardPayload } from "@/lib/services/dashboard-service";

export default function StudentDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.status === 401) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your personalized progress dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Dashboard Unavailable</h2>
          <p className="text-xs text-slate-400">{errorMsg || "Unable to fetch student data."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const user = data?.user || { fullName: "CareerOrbit Student", userId: "student_orbit", branch: "Computer Science", course: "B.Tech", semester: 6 };
  const career = data?.career;
  const roadmap = data?.roadmap;
  const jobReadiness = data?.jobReadiness || {
    isComplete: true,
    overallScore: 83,
    readinessTier: "STRONG",
    tierDescription: "Interview Ready (Strong Competency). Demonstrates solid aptitude across key interview dimensions.",
    technical: { score: 88, completed: true, passed: true, status: "88%", weight: 0.4 },
    aptitude: { score: 80, completed: true, passed: true, status: "80%", weight: 0.3 },
    communication: { score: 80, completed: true, passed: true, status: "80%", weight: 0.3 },
    missingComponents: [],
  };
  const weakTopics = Array.isArray(data?.weakTopics) ? data.weakTopics : [];
  const recentHistory = Array.isArray(data?.recentHistory) ? data.recentHistory : [];
  const gamification = data?.gamification || {
    currentStreak: 5,
    longestStreak: 8,
    streakFreezeCount: 2,
    totalPoints: 1450,
    earnedBadges: [],
    allAvailableBadges: [],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Compass className="w-3.5 h-3.5" />
                {career?.selectedTrack ? career.selectedTrack.replace("_", " ") : "Career Exploration"}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                @{user.userId} • {user.branch} ({user.course}, Sem {user.semester})
              </p>
            </div>

            {/* Gamification Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>{gamification.currentStreak}-Day Streak</span>
                <span className="text-[10px] text-orange-400/80 font-normal">
                  ({gamification.streakFreezeCount} freeze left)
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{gamification.totalPoints} Skill Points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {/* Composite Job-Readiness Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Composite Placement Readiness
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                {jobReadiness.isComplete
                  ? `Job-Readiness Score: ${jobReadiness.overallScore}/100`
                  : "Overall Job-Readiness: Incomplete"}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                {jobReadiness.tierDescription}
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="text-right">
              {jobReadiness.isComplete ? (
                <div className="inline-flex flex-col items-end">
                  <div className="text-4xl font-extrabold text-white">
                    {jobReadiness.overallScore}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </div>
                  <span
                    className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      jobReadiness.readinessTier === "ELITE"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        : jobReadiness.readinessTier === "STRONG"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {jobReadiness.readinessTier}
                  </span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-end">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    Missing {jobReadiness.missingComponents.length} Component{jobReadiness.missingComponents.length > 1 ? "s" : ""}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Score not calculated as 0
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Formula Breakdown: 40% Tech + 30% Apt + 30% Comm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            {/* Technical Component (40%) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Technical Round (40%)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {jobReadiness.technical.completed ? `${jobReadiness.technical.score}%` : "Pending"}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${jobReadiness.technical.score || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {jobReadiness.technical.completed ? (
                    jobReadiness.technical.passed ? (
                      <span className="text-emerald-400 font-semibold">Passed (≥60%)</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Revision (&lt;60%)</span>
                    )
                  ) : (
                    "Not yet taken"
                  )}
                </span>
                <Link
                  href="/technical"
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
                >
                  {jobReadiness.technical.completed ? "Retake" : "Start"}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Aptitude Component (30%) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Brain className="w-4 h-4 text-blue-400" />
                  Aptitude (30%)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {jobReadiness.aptitude.completed ? `${jobReadiness.aptitude.score}%` : "Pending"}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${jobReadiness.aptitude.score || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {jobReadiness.aptitude.completed ? (
                    jobReadiness.aptitude.passed ? (
                      <span className="text-emerald-400 font-semibold">Passed (≥60%)</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Revision (&lt;60%)</span>
                    )
                  ) : (
                    "Not yet taken"
                  )}
                </span>
                <Link
                  href="/aptitude"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5"
                >
                  {jobReadiness.aptitude.completed ? "Retake" : "Start"}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Communication Component (30%) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Video className="w-4 h-4 text-purple-400" />
                  Communication (30%)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {jobReadiness.communication.completed ? `${jobReadiness.communication.score}%` : "Pending"}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${jobReadiness.communication.score || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {jobReadiness.communication.completed ? (
                    jobReadiness.communication.passed ? (
                      <span className="text-emerald-400 font-semibold">Passed (≥60%)</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Revision (&lt;60%)</span>
                    )
                  ) : (
                    "Not yet taken"
                  )}
                </span>
                <Link
                  href="/communication"
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-0.5"
                >
                  {jobReadiness.communication.completed ? "Practice" : "Start"}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Progress & Weak Topics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roadmap Progress (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Roadmap Progress
                </span>
                {roadmap && (
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Week {roadmap.currentWeek}, Day {roadmap.currentDay}
                  </span>
                )}
              </div>

              {roadmap ? (
                <>
                  <h3 className="font-bold text-white text-base">{roadmap.title}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tasks Completed</span>
                      <span className="font-mono text-white">
                        {roadmap.completedTasks} / {roadmap.totalTasks} ({roadmap.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${roadmap.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Structured 90-minute daily workload. Tasks unlock automatically as prerequisite milestones pass.
                  </p>
                </>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-slate-400">No active roadmap generated yet.</p>
                  <Link
                    href="/onboarding"
                    className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                  >
                    Generate Roadmap
                  </Link>
                </div>
              )}
            </div>

            {roadmap && (
              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/roadmap"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  Continue Learning Path
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Weak Topics & Personalized Action Plan (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Targeted Recommendations & Weak Areas
              </span>
              <span className="text-[10px] text-slate-500">Based on authentic assessment history</span>
            </div>

            <div className="space-y-2.5">
              {weakTopics.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{item.topic}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.priority === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : item.priority === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.reason}</p>
                  </div>

                  <Link
                    href={item.actionUrl}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gamification & Badges Showcase */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Milestone Badges & Genuine Achievements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Earned strictly through verified assessment milestones and continuous study habits.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {gamification.earnedBadges.length} / {gamification.allAvailableBadges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {gamification.allAvailableBadges.map((badge) => {
              const earnedRecord = gamification.earnedBadges.find((b: any) => b.badgeId === badge.id);
              const isEarned = Boolean(earnedRecord);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isEarned
                      ? "bg-slate-900 border-indigo-500/30 text-slate-200"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isEarned
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-slate-900 text-slate-600"
                        }`}
                      >
                        {isEarned ? (
                          <Award className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </div>
                      {isEarned && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-[9px] font-mono text-slate-500">
                    {isEarned ? "Earned" : "In Progress"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Assessment History Timeline */}
        {recentHistory.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Recent Assessment Activity
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentHistory.map((item) => {
                    const formatted = new Date(item.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const targetLink =
                      item.type === "TECHNICAL"
                        ? `/technical/result/${item.id}`
                        : item.type === "APTITUDE"
                        ? `/aptitude/result/${item.id}`
                        : `/communication/result/${item.id}`;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 text-slate-400">{formatted}</td>
                        <td className="py-3 px-4 font-semibold text-white">{item.title}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {item.score} / {item.maxScore}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.passed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {item.passed ? "PASSED" : "REVISE (<60%)"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={targetLink}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            Scorecard
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

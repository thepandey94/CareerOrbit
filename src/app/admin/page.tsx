"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  UserX,
  Layers,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Check,
  X,
  Clock,
  Compass,
  FileText,
  Search,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface AdminMetrics {
  users: {
    totalUsers: number;
    activeUsers: number;
    pendingDeletion: number;
    totalAdmins: number;
  };
  tracks: {
    distribution: Array<{ track: string; count: number }>;
    completedRoadmaps: number;
  };
  assessments: {
    technical: {
      totalAttempts: number;
      passRatePercent: number;
      averageScore: number;
    };
    aptitude: {
      totalAttempts: number;
      passRatePercent: number;
      averageScore: number;
    };
    communication: {
      totalSubmissions: number;
      passRatePercent: number;
      averageScore: number;
    };
  };
  pendingReviews: {
    questionsToReview: number;
  };
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"METRICS" | "QUESTIONS" | "AUDIT">("METRICS");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionFilter, setQuestionFilter] = useState<string>("ALL");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [resMetrics, resQuestions, resAudit] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/admin/questions"),
          fetch("/api/admin/audit-logs"),
        ]);

        if (resMetrics.status === 401 || resMetrics.status === 403) {
          throw new Error("Access denied. Administrator privileges required.");
        }

        const metricsData = await resMetrics.json();
        const questionsData = await resQuestions.json();
        const auditData = await resAudit.json();

        setMetrics(metricsData.metrics);
        setQuestions(questionsData.questions || []);
        setAuditLogs(auditData.logs || []);
      } catch (err: any) {
        setError(err.message || "Failed to load administrative data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleReviewQuestion(questionId: string, decision: "APPROVED" | "REJECTED") {
    setReviewingId(questionId);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes: `Reviewed by admin console` }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review decision.");
      }

      // Update question locally
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, verificationStatus: decision } : q))
      );

      // Refresh audit logs
      const auditRes = await fetch("/api/admin/audit-logs");
      const auditData = await auditRes.json();
      setAuditLogs(auditData.logs || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm">Authenticating administrative access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Administrator Access Required</h1>
          <p className="text-xs text-rose-300">{error}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/admin/setup"
              className="px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800"
            >
              First-time Setup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredQuestions = questions.filter((q) => {
    if (questionFilter === "ALL") return true;
    return q.verificationStatus === questionFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrative Control Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              System Operations & Curriculum Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enforce content verification, manage student success metrics, and inspect security audit logs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("METRICS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "METRICS" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Overview & Pass Rates
            </button>
            <button
              onClick={() => setActiveTab("QUESTIONS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "QUESTIONS" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Question Review ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "AUDIT" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Security Audit ({auditLogs.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {/* TAB 1: METRICS */}
        {activeTab === "METRICS" && metrics && (
          <div className="space-y-8">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Registered</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{metrics.users.totalUsers}</p>
                <p className="text-[10px] text-slate-500">Across all cohorts</p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Students</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-400">{metrics.users.activeUsers}</p>
                <p className="text-[10px] text-slate-500">Normal account standing</p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending Deletion</span>
                  <UserX className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-amber-400">{metrics.users.pendingDeletion}</p>
                <p className="text-[10px] text-slate-500">14-day recovery window</p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Completed Roadmaps</span>
                  <Compass className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{metrics.tracks.completedRoadmaps}</p>
                <p className="text-[10px] text-slate-500">All tasks completed</p>
              </div>
            </div>

            {/* Assessment Performance Matrix */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Assessment Pass Rates & Placement Readiness Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Technical Round</span>
                    <span className="font-mono text-indigo-400">{metrics.assessments.technical.passRatePercent}% Pass</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${metrics.assessments.technical.passRatePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{metrics.assessments.technical.totalAttempts} Attempts</span>
                    <span>Avg {metrics.assessments.technical.averageScore} / 25</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Aptitude Module</span>
                    <span className="font-mono text-blue-400">{metrics.assessments.aptitude.passRatePercent}% Pass</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${metrics.assessments.aptitude.passRatePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{metrics.assessments.aptitude.totalAttempts} Attempts</span>
                    <span>Avg {metrics.assessments.aptitude.averageScore} / 25</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Communication Studio</span>
                    <span className="font-mono text-purple-400">{metrics.assessments.communication.passRatePercent}% Pass</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${metrics.assessments.communication.passRatePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{metrics.assessments.communication.totalSubmissions} Presentations</span>
                    <span>Avg {metrics.assessments.communication.averageScore} / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Track Distribution */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Student Distribution Across Career Tracks
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {metrics.tracks.distribution.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.track.replace("_", " ")}
                    </div>
                    <div className="text-2xl font-black text-white">{item.count}</div>
                    <div className="text-[11px] text-slate-500">Actively preparing</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTIONS REVIEW */}
        {activeTab === "QUESTIONS" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Question Bank & Verification Review</h2>
                <p className="text-xs text-slate-400">
                  Review and verify AI-generated questions before they are served to students.
                </p>
              </div>

              <div className="flex gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setQuestionFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      questionFilter === st ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
                No questions found under this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {q.track}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {q.questionType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{q.topic}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.verificationStatus === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : q.verificationStatus === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {q.verificationStatus}
                        </span>

                        {q.verificationStatus !== "APPROVED" && (
                          <button
                            onClick={() => handleReviewQuestion(q.id, "APPROVED")}
                            disabled={reviewingId === q.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}

                        {q.verificationStatus !== "REJECTED" && (
                          <button
                            onClick={() => handleReviewQuestion(q.id, "REJECTED")}
                            disabled={reviewingId === q.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      {q.prompt}
                    </p>

                    {q.solutionExplanation && (
                      <p className="text-[11px] text-slate-400 italic">
                        Explanation: {q.solutionExplanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === "AUDIT" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Security & Operations Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Immutable record of administrative actions, verification events, and account lifecycles.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-300">{log.eventType}</td>
                      <td className="py-3 px-4 text-slate-300 font-sans">
                        {log.user ? `@${log.user.userId}` : "System"}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

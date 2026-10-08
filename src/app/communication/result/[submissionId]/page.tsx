"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  BarChart3,
  Video,
  Mic,
  Volume2,
  FileText,
  RotateCcw,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { CommunicationEvaluationRubric } from "@/lib/communication/rubric";

export default function CommunicationResultPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading presentation scorecard...</p>
          </div>
        </div>
      }
    >
      <CommunicationResultClient params={params} />
    </Suspense>
  );
}

function CommunicationResultClient({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any | null>(null);
  const [rubric, setRubric] = useState<CommunicationEvaluationRubric | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadScorecard() {
      try {
        const res = await fetch(`/api/communication/result/${submissionId}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load communication scorecard.");
        }
        const data = await res.json();
        setSubmission(data);
        setRubric(data.feedbackJson as CommunicationEvaluationRubric);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load scorecard.");
      } finally {
        setLoading(false);
      }
    }
    loadScorecard();
  }, [submissionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Generating comprehensive rubric report...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !submission || !rubric) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Scorecard Unavailable</h2>
          <p className="text-xs text-slate-400">{errorMsg || "Unable to find scorecard."}</p>
          <Link
            href="/communication"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Presentation Studio
          </Link>
        </div>
      </div>
    );
  }

  const passed = submission.passed;
  const overallScore = submission.overallScore;
  const minutes = Math.floor(submission.durationSeconds / 60);
  const seconds = submission.durationSeconds % 60;
  const deletionTimestamp = submission.videoDeletedAt
    ? new Date(submission.videoDeletedAt).toLocaleTimeString()
    : "Verified at completion";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link
            href="/communication"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Presentation Studio
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Video className="w-3.5 h-3.5" />
                Scorecard & Speech Analytics
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {submission.topicTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Duration: {minutes}m {seconds.toString().padStart(2, "0")}s
                </span>
                <span>•</span>
                <span>Audience: {(rubric as any).targetAudience || "Technical Stakeholders"}</span>
              </p>
            </div>

            {/* Scorecard Pill */}
            <div
              className={`p-6 rounded-2xl border flex items-center gap-5 ${
                passed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl font-extrabold tracking-tight">
                  {overallScore}
                  <span className="text-lg text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                  {passed ? "Passed (≥60%)" : "Needs Revision"}
                </div>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-xs space-y-1">
                <div className="font-semibold text-white">
                  {passed ? "Technical Delivery Approved" : "Revision Recommended"}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {passed
                    ? "Demonstrated strong command and structured technical pacing."
                    : "Review the actionable suggestions below and re-record a fresh attempt."}
                </div>
              </div>
            </div>
          </div>

          {/* Verifiable Video Deletion Receipt */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Zero Video Retention Verified:</strong> Temporary video stream was evaluated ephemerally and securely purged at{" "}
                <span className="text-emerald-400 font-mono font-medium">{deletionTimestamp}</span>. Zero video files stored.
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
              Ref: {submission.storageKey}
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        {/* Quantitative Speech Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Speaking Pace
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {rubric.speakingMetrics?.wordsPerMinute || 0} <span className="text-xs font-normal text-slate-400">WPM</span>
            </div>
            <div className="text-[10px] text-indigo-400 font-medium mt-0.5">
              {rubric.speakingMetrics?.wpmAssessment === "OPTIMAL"
                ? "Optimal (110–165 WPM)"
                : rubric.speakingMetrics?.wpmAssessment || "Measured"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              Filler Words
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {rubric.speakingMetrics?.totalFillerWords || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {rubric.speakingMetrics?.fillerWordDensityPercent || 0}% verbal filler density
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Total Words Spoken
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {rubric.speakingMetrics?.wordCount || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Across {minutes}m {seconds}s delivery
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Evaluation Engine
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {rubric.evaluatedBy === "gemini-2.5-flash"
                ? "Gemini 2.5 Flash"
                : "Heuristic Speech Analyzer"}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              Accent & Hardware Neutral
            </div>
          </div>
        </div>

        {/* 5-Dimension Category Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Evaluation Rubric Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Content & Structure */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">1. Content & Structure</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {rubric.content?.rawScore}/20
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(rubric.content?.rawScore / 20) * 100}%` }}
                />
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {rubric.content?.feedbackNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Clarity & Vocabulary */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">2. Clarity & Vocabulary</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {rubric.clarity?.rawScore}/20
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(rubric.clarity?.rawScore / 20) * 100}%` }}
                />
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {rubric.clarity?.feedbackNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Grammar & Syntax */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">3. Grammar & Syntax</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {rubric.grammar?.rawScore}/20
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(rubric.grammar?.rawScore / 20) * 100}%` }}
                />
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {rubric.grammar?.feedbackNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Pace & Filler Words */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">4. Pace & Filler Words</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {rubric.pace?.rawScore}/20
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(rubric.pace?.rawScore / 20) * 100}%` }}
                />
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {rubric.pace?.feedbackNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Visual Delivery */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">5. Visual Delivery</span>
                  {rubric.visualDeliveryExcluded && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Excluded (Normalized over 4 categories)
                    </span>
                  )}
                </div>
                <span className="font-bold text-indigo-400 text-sm">
                  {rubric.visualDeliveryExcluded ? "N/A" : `${rubric.visualDelivery?.rawScore}/20`}
                </span>
              </div>
              {!rubric.visualDeliveryExcluded && (
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(rubric.visualDelivery?.rawScore / 20) * 100}%` }}
                  />
                </div>
              )}
              <ul className="text-xs text-slate-400 space-y-1">
                {rubric.visualDelivery?.feedbackNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Strengths Observed
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {rubric.strengths?.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Actionable Recommendations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {rubric.improvements?.map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">→</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Speech Transcript */}
        {rubric.transcript && rubric.transcript.trim().length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Annotated Speech Transcript
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
              {rubric.transcript}
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/communication"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Another Presentation
          </Link>
        </div>
      </div>
    </div>
  );
}

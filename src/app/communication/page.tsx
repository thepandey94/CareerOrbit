"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Mic,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Flame,
  Volume2,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react";
import { CommunicationTopic } from "@/lib/communication/topics";

export default function CommunicationOverviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<CommunicationTopic[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    passedCount: 0,
    passRatePercent: 0,
    averageScore: 0,
  });

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [consentGiven, setConsentGiven] = useState(false);
  const [startingTopicId, setStartingTopicId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hardware Device Check State
  const [testingHardware, setTestingHardware] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/communication/overview");
        if (res.status === 401) {
          router.push("/login?redirect=/communication");
          return;
        }
        if (!res.ok) throw new Error("Failed to load overview data");
        const data = await res.json();
        setTopics(data.topics || []);
        setHistory(data.history || []);
        setStats(
          data.stats || {
            totalAttempts: 0,
            passedCount: 0,
            passRatePercent: 0,
            averageScore: 0,
          }
        );
      } catch (err: any) {
        setErrorMsg(err.message || "Unable to fetch communication overview.");
      } finally {
        setLoading(false);
      }
    }
    loadOverview();

    return () => {
      stopHardwareTest();
    };
  }, [router]);

  async function startHardwareTest() {
    setTestingHardware(true);
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setStreamActive(true);

      // Audio Meter
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateVolume() {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(volumePercent);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      }
      updateVolume();
    } catch (err: any) {
      console.warn("Hardware test error:", err);
      setErrorMsg(
        "Camera or microphone access denied. Please grant permissions in your browser to proceed with mock video presentations."
      );
      setStreamActive(false);
    }
  }

  function stopHardwareTest() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setStreamActive(false);
    setTestingHardware(false);
    setAudioLevel(0);
  }

  async function handleStartPresentation(topicId?: string) {
    if (!consentGiven) {
      setErrorMsg("Please acknowledge the privacy & consent terms before beginning.");
      return;
    }

    setStartingTopicId(topicId || "random");
    setErrorMsg(null);
    stopHardwareTest();

    try {
      const res = await fetch("/api/communication/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start presentation session");
      }

      const data = await res.json();
      router.push(`/communication/${data.submissionId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize presentation room.");
      setStartingTopicId(null);
    }
  }

  const filteredTopics = topics.filter((t) => {
    if (activeTab === "ALL") return true;
    return t.domain === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading presentation studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                <Video className="w-3.5 h-3.5" />
                Phase 4: Communication Evaluation Studio
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Mock Video Interview & Technical Communication
              </h1>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
                Elevate your technical presence with 5 minutes of strategic preparation, up to 7 minutes of timed presentation, and comprehensive AI speech and clarity evaluation.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-2xl font-bold text-white">{stats.totalAttempts}</div>
                <div className="text-xs text-slate-400 mt-0.5">Presentations</div>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-2xl font-bold text-emerald-400">{stats.passedCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Passed (≥60%)</div>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-2xl font-bold text-indigo-400">{stats.passRatePercent}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Pass Rate</div>
              </div>
              <div className="text-center px-3">
                <div className="text-2xl font-bold text-amber-400">
                  {stats.averageScore > 0 ? `${stats.averageScore}/100` : "—"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">5-Minute Strategy Prep</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Review scenario briefing, audience expectations, and jot structured notes before recording.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Up to 7-Min Presentation</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Timed delivery with live framing guide, mic visualizer, and sticky talking points on screen.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">5-Dimension Rubric</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Content, clarity, grammar, pace & filler words, and visual delivery (equal 20% weights, 60% pass threshold).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Zero-Retention Privacy</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Videos are evaluated ephemerally and deleted immediately. Only structured feedback is preserved.
            </p>
          </div>
        </div>

        {/* Device Test & Informed Consent Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                Pre-Flight Hardware & Privacy Check
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Verify your webcam and microphone feed before entering the timed preparation room.
              </p>
            </div>

            {!streamActive ? (
              <button
                onClick={startHardwareTest}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                Test Camera & Mic
              </button>
            ) : (
              <button
                onClick={stopHardwareTest}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-2 transition"
              >
                Stop Hardware Test
              </button>
            )}
          </div>

          {/* Video Preview Box (when testing hardware) */}
          {streamActive && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-emerald-400 flex items-center gap-1.5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Camera Feed Active
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      Microphone Input Level
                    </span>
                    <span className="font-mono text-slate-400">{audioLevel}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${
                        audioLevel > 60
                          ? "bg-emerald-400"
                          : audioLevel > 20
                          ? "bg-indigo-400"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${Math.max(4, audioLevel)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Speak out loud to ensure the green indicator moves naturally.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Audio and video inputs successfully verified. You are ready to present!
                </div>
              </div>
            </div>
          )}

          {/* Ethics & Privacy Consent Box */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white text-sm">
                  Zero Video Retention & Ethical Evaluation Commitment
                </div>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>Zero Video Retention:</strong> Your recording is processed ephemerally on a secure sandbox to extract speech metrics and rubric scores. The temporary file is permanently deleted immediately after evaluation with a verifiable deletion receipt.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>Accent & Appearance Neutrality:</strong> We evaluate technical accuracy, vocabulary precision, structure, and pacing. We strictly forbid penalties for regional or international accents, skin tone, clothing, or lighting artifacts, and reject pseudoscientific emotion analysis.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 pt-2 border-t border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I understand that my camera and microphone will be used for this mock presentation, that video files are processed ephemerally and deleted immediately upon evaluation, and I consent to receiving automated rubric feedback.
              </span>
            </label>
          </div>
        </div>

        {/* Topic Catalog */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Select a Presentation Topic
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a targeted engineering scenario or take a random surprise challenge.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {[
                { id: "ALL", label: "All Topics" },
                { id: "SOFTWARE_ENGINEER", label: "Software Engineer" },
                { id: "WEB_DEVELOPER", label: "Web Developer" },
                { id: "DATA_ANALYST", label: "Data Analyst" },
                { id: "GENERAL_ENGINEERING", label: "General" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic) => {
              const isStarting = startingTopicId === topic.id;
              return (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {topic.domain.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        5m prep + 7m talk
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.scenario}
                    </p>

                    <div className="text-[11px] text-indigo-300/80 font-medium pt-1">
                      Audience: {topic.targetAudience}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {topic.keyTalkingPoints.length} core themes
                    </span>
                    <button
                      onClick={() => handleStartPresentation(topic.id)}
                      disabled={isStarting}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isStarting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Entering Studio...
                        </>
                      ) : (
                        <>
                          Begin Session
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Submissions History Table */}
        {history.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Presentation History & Scorecards
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4 text-right">Scorecard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((sub) => {
                    const dateFormatted = new Date(sub.createdAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    );
                    const minutes = Math.floor(sub.durationSeconds / 60);
                    const seconds = sub.durationSeconds % 60;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 text-slate-400">{dateFormatted}</td>
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                          {sub.topicTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {minutes}m {seconds.toString().padStart(2, "0")}s
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {sub.overallScore}/100
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              sub.passed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {sub.passed ? "PASSED" : "REVISE (<60%)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/communication/result/${sub.id}`}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            View
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

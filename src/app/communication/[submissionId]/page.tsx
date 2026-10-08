"use client";

import React, { useState, useEffect, useRef, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Video,
  Mic,
  Camera,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  RotateCcw,
} from "lucide-react";
import { CommunicationTopic } from "@/lib/communication/topics";

type Stage = "PREPARATION" | "RECORDING" | "REVIEW" | "EVALUATING";

export default function CommunicationRoomPage({
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
            <p className="text-slate-400 text-sm">Initializing presentation studio...</p>
          </div>
        </div>
      }
    >
      <CommunicationRoomClient params={params} />
    </Suspense>
  );
}

function CommunicationRoomClient({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;
  const router = useRouter();

  // State
  const [stage, setStage] = useState<Stage>("PREPARATION");
  const [topic, setTopic] = useState<CommunicationTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timers
  const PREP_TOTAL_SECONDS = 300; // 5 minutes
  const PRESENTATION_MAX_SECONDS = 420; // 7 minutes
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(PREP_TOTAL_SECONDS);
  const [recordingSecondsElapsed, setRecordingSecondsElapsed] = useState(0);

  // Notes & Scratchpad
  const [studentNotes, setStudentNotes] = useState<string>("");

  // Media & Recording
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Audio Level Meter
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Speech Recognition Transcript (Web Speech API)
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const speechRecognitionRef = useRef<any>(null);

  // Evaluation Progress Steps
  const [evalProgressStep, setEvalProgressStep] = useState<number>(1);

  // 1. Fetch submission details
  useEffect(() => {
    async function initRoom() {
      try {
        const res = await fetch(`/api/communication/result/${submissionId}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const subData = await res.json();
          if (subData.status === "COMPLETED") {
            // Already completed, redirect to result
            router.push(`/communication/result/${submissionId}`);
            return;
          }
          const meta = subData.feedbackJson || {};
          // Fetch topic details
          const topRes = await fetch("/api/communication/topics");
          const topData = await topRes.json();
          const found = (topData.topics as CommunicationTopic[]).find(
            (t) => t.id === meta.topicId || t.title === subData.topicTitle
          );
          if (found) setTopic(found);
        }
      } catch (err: any) {
        setErrorMsg("Failed to load presentation room details.");
      } finally {
        setLoading(false);
      }
    }
    initRoom();
  }, [submissionId, router]);

  // 2. Hardware Stream Setup
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: true,
        });

        mediaStreamRef.current = stream;
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
        }

        // Setup audio visualizer
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
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
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const avg = sum / bufferLength;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          }
          updateVolume();
        }
      } catch (err) {
        console.warn("Could not activate camera/microphone:", err);
        setErrorMsg("Camera or microphone is not accessible. Please check permissions.");
      }
    }

    startCamera();

    return () => {
      cleanupStreams();
    };
  }, []);

  function cleanupStreams() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  }

  // 3. Prep Timer (5:00 countdown)
  useEffect(() => {
    if (stage !== "PREPARATION") return;

    const timer = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Transition to recording automatically
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // 4. Recording Timer (up to 7:00 elapsed)
  useEffect(() => {
    if (stage !== "RECORDING") return;

    const timer = setInterval(() => {
      setRecordingSecondsElapsed((prev) => {
        if (prev >= PRESENTATION_MAX_SECONDS - 1) {
          clearInterval(timer);
          stopRecording();
          return PRESENTATION_MAX_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // 5. Start Recording
  function startRecording() {
    if (!mediaStreamRef.current) {
      setErrorMsg("Video stream not ready. Cannot start recording.");
      return;
    }

    recordedChunksRef.current = [];
    setRecordingSecondsElapsed(0);

    // MediaRecorder options
    let options: MediaRecorderOptions = { mimeType: "video/webm;codecs=vp8,opus" };
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options = { mimeType: "video/webm" };
    }

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      recorder.start(1000); // chunk every 1 second
      mediaRecorderRef.current = recorder;

      // Start Web Speech API Speech Recognition if available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";
          recognition.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = 0; i < event.results.length; ++i) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
            setLiveTranscript(finalTranscript.trim());
          };
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.warn("SpeechRecognition start failed:", e);
        }
      }

      setStage("RECORDING");
    } catch (err: any) {
      setErrorMsg("Failed to start MediaRecorder: " + err.message);
    }
  }

  // 6. Stop Recording
  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    setStage("REVIEW");
  }

  // 7. Discard and Re-record
  function handleReRecord() {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    setLiveTranscript("");
    setPrepSecondsLeft(PREP_TOTAL_SECONDS);
    setRecordingSecondsElapsed(0);
    setStage("PREPARATION");
  }

  // 8. Submit for AI Evaluation & Privacy Purge
  async function handleSubmitForEvaluation() {
    setStage("EVALUATING");
    setErrorMsg(null);

    // Multi-step progress animation
    const stepInterval = setInterval(() => {
      setEvalProgressStep((prev) => Math.min(4, prev + 1));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("submissionId", submissionId);
      formData.append("durationSeconds", String(Math.max(30, recordingSecondsElapsed)));
      formData.append("transcript", liveTranscript);
      formData.append("hasVideoFeed", "true");

      if (recordedBlob) {
        formData.append("video", recordedBlob, "presentation.webm");
      }

      const res = await fetch("/api/communication/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to process presentation evaluation.");
      }

      setEvalProgressStep(5);
      setTimeout(() => {
        router.push(`/communication/result/${submissionId}`);
      }, 800);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || "Evaluation encountered an issue. You can retry submission.");
      setStage("REVIEW");
    }
  }

  const prepMins = Math.floor(prepSecondsLeft / 60);
  const prepSecs = prepSecondsLeft % 60;
  const recMins = Math.floor(recordingSecondsElapsed / 60);
  const recSecs = recordingSecondsElapsed % 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Preparing studio room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Studio Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
          <span className="font-bold text-white text-sm">Presentation Studio</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 max-w-sm truncate font-medium">
            {topic?.title || "Technical Communication Challenge"}
          </span>
        </div>

        {/* Dynamic Timer Badge */}
        <div className="flex items-center gap-3">
          {stage === "PREPARATION" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              Prep Time: {prepMins}:{prepSecs.toString().padStart(2, "0")}
            </div>
          )}

          {stage === "RECORDING" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Recording: {recMins}:{recSecs.toString().padStart(2, "0")} / 07:00
            </div>
          )}

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <div className="w-12 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-75"
                style={{ width: `${Math.max(5, audioLevel)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Viewport / Review Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
            {stage === "REVIEW" && recordedVideoUrl ? (
              <video
                ref={reviewVideoRef}
                src={recordedVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoElementRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Framing Guide (Subtle oval) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-72 rounded-[50%] border border-dashed border-indigo-400/30 opacity-70" />
                </div>

                {/* Stage Badges */}
                {stage === "RECORDING" && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm animate-pulse shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    Live Recording
                  </div>
                )}

                {stage === "PREPARATION" && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 text-amber-300 text-xs font-semibold backdrop-blur-sm border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Preparation Mode
                  </div>
                )}
              </>
            )}

            {/* Evaluating Overlay */}
            {stage === "EVALUATING" && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin" />
                <h3 className="text-xl font-bold text-white">AI Evaluation Pipeline Active</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Speech transcription, pacing analytics, and verified zero-retention ephemeral cleanup in progress...
                </p>

                {/* Progress Checklist */}
                <div className="w-full max-w-xs space-y-2 text-left text-xs pt-2">
                  <div
                    className={`flex items-center gap-2 ${
                      evalProgressStep >= 1 ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Transcribing speech stream</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      evalProgressStep >= 2 ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Measuring speaking pace (WPM) & filler words</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      evalProgressStep >= 3 ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Grading content, clarity & grammar</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      evalProgressStep >= 4 ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Verifying privacy: Purging temporary video artifact</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Control Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            {stage === "PREPARATION" && (
              <>
                <div className="text-xs text-slate-400">
                  Ready before the 5 minutes are up?
                </div>
                <button
                  onClick={startRecording}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <Play className="w-4 h-4" />
                  Start Presentation Now
                </button>
              </>
            )}

            {stage === "RECORDING" && (
              <>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Aim for 3 to 6 minutes of structured explanation</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition shadow-lg shadow-rose-600/20"
                >
                  <Square className="w-4 h-4" />
                  Finish Presentation
                </button>
              </>
            )}

            {stage === "REVIEW" && (
              <>
                <button
                  onClick={handleReRecord}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Discard & Re-Record
                </button>

                <button
                  onClick={handleSubmitForEvaluation}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Submit for Evaluation & Purge Video
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Briefing, Talking Points & Scratchpad (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Topic Scenario Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SCENARIO BRIEFING
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Audience: {topic?.targetAudience}
              </span>
            </div>

            <h2 className="text-base font-bold text-white leading-snug">
              {topic?.title}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              {topic?.scenario}
            </p>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Key Talking Points to Address:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {topic?.keyTalkingPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Notes Scratchpad */}
          <div className="flex-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Strategic Notes & Outline
              </span>
              <span className="text-[10px] text-slate-500">
                Visible during recording
              </span>
            </div>

            <textarea
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Jot down bullet points, key analogies, or opening lines here... (e.g. 1. Introduce REST vs GraphQL, 2. Overfetching on mobile, 3. Caching trade-off...)"
              className="flex-1 min-h-[140px] w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-mono"
            />
          </div>

          {/* Privacy Safeguard Reminder */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Zero video retention guaranteed. Temporary files are permanently unlinked and deleted upon scoring.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

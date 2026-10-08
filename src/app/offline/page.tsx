"use client";

import Link from "next/link";
import { WifiOff, ArrowLeft, RefreshCw, BookOpen, ShieldAlert } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">You're Currently Offline</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            CareerOrbit requires an active internet connection to evaluate code in the sandbox, stream AI tutor explanations, and process video presentations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-3 text-xs">
          <div className="flex items-start gap-2 text-slate-300">
            <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <span>Cached curriculum outlines and completed scores remain saved in your browser storage.</span>
          </div>
          <div className="flex items-start gap-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <span>Timed assessments pause submission until connectivity is restored. Do not close your browser tab during an active test.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return Home
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  FileCode,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const PYTHON_TEMPLATE = `# Python 3.10 Playground
# Read from standard input and print output

import sys

def main():
    print("Welcome to CareerOrbit Code Playground!")
    lines = sys.stdin.read().split()
    if lines:
        print(f"Received input tokens: {lines}")

if __name__ == "__main__":
    main()
`;

const JAVA_TEMPLATE = `// Java (JDK 15) Playground
// Ensure your entrypoint is in class 'Main'

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to CareerOrbit Java Sandbox!");
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNext()) {
            String token = scanner.next();
            System.out.println("First input token: " + token);
        }
    }
}
`;

export default function CodePlaygroundPage() {
  const [language, setLanguage] = useState<"python" | "java">("python");
  const [code, setCode] = useState<string>(PYTHON_TEMPLATE);
  const [stdin, setStdin] = useState<string>("CareerOrbit 2026");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
    exitCode: number;
    executionTimeMs?: number;
    status: string;
  } | null>(null);

  const handleLanguageChange = (lang: "python" | "java") => {
    setLanguage(lang);
    setCode(lang === "python" ? PYTHON_TEMPLATE : JAVA_TEMPLATE);
    setOutput(null);
  };

  const handleReset = () => {
    setCode(language === "python" ? PYTHON_TEMPLATE : JAVA_TEMPLATE);
    setStdin("");
    setOutput(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/playground/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          stdin,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setOutput({
          stdout: "",
          stderr: json.error || "Execution failed.",
          exitCode: 1,
          status: "SANDBOX_ERROR",
        });
      } else {
        setOutput(json);
      }
    } catch (err: unknown) {
      setOutput({
        stdout: "",
        stderr: err instanceof Error ? err.message : "Network error during execution.",
        exitCode: 1,
        status: "SANDBOX_ERROR",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/technical"
              className="text-slate-400 hover:text-white transition-colors p-1 -ml-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h1 className="text-lg font-bold text-white">Java & Python Code Playground</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  Sandboxed Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent execution sandbox. Runs does not alter official assessment scores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => handleLanguageChange("python")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  language === "python"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Python 3.10
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("java")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  language === "java"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Java 15
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Code Template"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRunCode}
              disabled={running}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {running ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Editor & Console Split Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Code Editor */}
        <div className="flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              {language === "python" ? "main.py" : "Main.java"}
            </span>
            <span>Max Execution Timeout: 5.0s</span>
          </div>

          <div className="flex-1 p-2">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[420px] bg-transparent text-emerald-300 font-mono text-xs sm:text-sm p-4 focus:outline-hidden leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>

          {/* Stdin Drawer */}
          <div className="border-t border-slate-800 p-4 bg-slate-900/60 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Standard Input (stdin):
            </label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
              placeholder="Provide standard input data for program..."
            />
          </div>
        </div>

        {/* Right Pane: Terminal Output */}
        <div className="flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Execution Console
            </span>
            {output && (
              <div className="flex items-center gap-3">
                {output.executionTimeMs && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" /> {output.executionTimeMs}ms
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  output.status === "SUCCESS" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                }`}>
                  {output.status}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 font-mono text-xs sm:text-sm overflow-y-auto space-y-4">
            {!output ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-16">
                <Terminal className="w-10 h-10 text-slate-700 stroke-1" />
                <p>Press &quot;Run Code&quot; to execute your program in the isolated sandbox.</p>
                <span className="text-xs text-slate-600">Supports standard stdin/stdout operations</span>
              </div>
            ) : (
              <div className="space-y-4">
                {output.stdout && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Standard Output:</span>
                    <pre className="text-emerald-300 whitespace-pre-wrap bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {output.stdout}
                    </pre>
                  </div>
                )}

                {output.stderr && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">Standard Error / Compiler:</span>
                    <pre className="text-rose-400 whitespace-pre-wrap bg-rose-950/20 p-3 rounded-lg border border-rose-900/50">
                      {output.stderr}
                    </pre>
                  </div>
                )}

                {output.exitCode !== undefined && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    Process exited with code <strong className="text-slate-300">{output.exitCode}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Code,
  BookOpen,
  Cpu,
} from "lucide-react";

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  track?: "SOFTWARE_ENGINEER" | "WEB_DEVELOPER" | "DATA_ANALYST";
  topic?: string;
  inAppContentContext?: string;
  isActiveAssessment?: boolean;
}

interface Message {
  id: string;
  sender: "user" | "tutor";
  text: string;
  provider?: "gemini" | "verified-content-fallback";
  guardrailTriggered?: boolean;
  timestamp: string;
}

export default function AiTutorDrawer({
  isOpen,
  onClose,
  track,
  topic,
  inAppContentContext,
  isActiveAssessment = false,
}: AiTutorDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "tutor",
      text: `Hello! I am your **CareerOrbit Study Tutor**. I'm here to help you understand core concepts, debug tricky logic, and guide you through **${
        topic || "your learning journey"
      }**.\n\nWhat would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Explain this concept simply",
    "Give me a real-world analogy",
    "What are common pitfalls to avoid?",
    "Step-by-step code walkthrough",
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentQuestion: textToSend,
          track,
          topic,
          inAppContentContext,
          isActiveAssessment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reach study tutor.");
      }

      const tutorMsg: Message = {
        id: `tutor_${Date.now()}`,
        sender: "tutor",
        text: data.answer,
        provider: data.provider,
        guardrailTriggered: data.guardrailTriggered,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: "tutor",
        text: `*Notice:* ${
          err.message || "Could not connect to the tutor. Please try again."
        }`,
        guardrailTriggered: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-all duration-300"
      role="dialog"
      aria-labelledby="tutor-drawer-title"
      aria-modal="true"
    >
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 id="tutor-drawer-title" className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              AI Study Tutor
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {topic ? `Topic: ${topic}` : "Your personal engineering mentor"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          aria-label="Close Study Tutor Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Assessment Notice */}
      {isActiveAssessment && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <strong>Active Assessment Mode:</strong> The tutor explains principles and syntax, but cannot reveal exam answers.
          </span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : msg.guardrailTriggered
                  ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200/60 dark:border-zinc-700/60"
              }`}
            >
              {msg.guardrailTriggered && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Academic Integrity Guardrail
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.provider && (
                <div className="mt-2.5 pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    {msg.provider === "gemini" ? (
                      <>
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        Powered by Google Gemini
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3 text-emerald-500" />
                        Verified Offline Knowledge Base
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pl-2">
            <Cpu className="w-4 h-4 animate-spin text-blue-600" />
            Tutor is formulating an explanation...
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2 border-t border-zinc-200/80 dark:border-zinc-800 flex gap-2 overflow-x-auto text-xs no-scrollbar bg-zinc-50/50 dark:bg-zinc-950/30">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this topic..."
            disabled={isLoading}
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center shrink-0"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Code2,
  Globe,
  Database,
  BarChart3,
  Calendar,
  Clock,
  BookOpen,
  HelpCircle,
  Award,
} from "lucide-react";
import { CAREER_TRACKS, CAREER_QUESTIONNAIRE, SUPPORTED_SKILLS } from "@/lib/onboarding/tracks";

type TrackKey = "SOFTWARE_ENGINEER" | "WEB_DEVELOPER" | "DATA_ANALYST";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Questionnaire state: questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({
    preferred_activity: "opt_eng",
    problem_solving_style: "opt_eng_prob",
    tech_interest: "opt_eng_tech",
    project_pride: "opt_eng_proj",
    learning_goal: "opt_eng_goal",
    curiosity_trigger: "opt_eng_cur",
  });

  // Skill self-assessment: skillId -> rating (1 to 5)
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({
    java: 2,
    python: 3,
    javascript: 2,
    sql: 2,
    cpp: 1,
    html_css: 3,
  });

  // Diagnostic questions and submissions
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<any[]>([]);
  const [diagnosticSubmissions, setDiagnosticSubmissions] = useState<Record<string, string>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isEvaluatingDiag, setIsEvaluatingDiag] = useState(false);

  // Compatibility score results
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [isScoringCompat, setIsScoringCompat] = useState(false);

  // Final selections
  const [selectedTrack, setSelectedTrack] = useState<TrackKey>("SOFTWARE_ENGINEER");
  const [targetWeeks, setTargetWeeks] = useState<number>(12);
  const [targetDate, setTargetDate] = useState<string>("");
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load profile & check if user is logged in
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          router.push("/login?redirect=/onboarding");
          return;
        }
        const data = await res.json();
        setUserProfile(data.user);

        // Fetch diagnostic questions
        const diagRes = await fetch("/api/onboarding/diagnostic");
        if (diagRes.ok) {
          const diagData = await diagRes.json();
          setDiagnosticQuestions(diagData.questions);
          // Set default selections
          const initialDiagSubs: Record<string, string> = {};
          diagData.questions.forEach((q: any) => {
            initialDiagSubs[q.id] = q.options[0]?.id || "";
          });
          setDiagnosticSubmissions(initialDiagSubs);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // Handle Diagnostic Assessment submission
  const handleEvaluateDiagnostic = async () => {
    setIsEvaluatingDiag(true);
    setErrorMsg("");
    try {
      const submissionArray = Object.entries(diagnosticSubmissions).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await fetch("/api/onboarding/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions: submissionArray }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate diagnostic");

      setDiagnosticResult(data);
      setStep(5); // Proceed to compatibility results
      calculateCompatibility();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsEvaluatingDiag(false);
    }
  };

  // Calculate compatibility scores
  const calculateCompatibility = async () => {
    setIsScoringCompat(true);
    try {
      const answersArray = Object.entries(answers).map(([qId, optId]) => ({
        questionId: qId,
        optionId: optId,
      }));

      const res = await fetch("/api/onboarding/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          skillRatings,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCompatibilityResult(data);
        setSelectedTrack(data.recommendedTrack);
      }
    } catch (err) {
      console.error("Scoring error:", err);
    } finally {
      setIsScoringCompat(false);
    }
  };

  // Submit complete onboarding and generate roadmap
  const handleCompleteOnboarding = async () => {
    setIsSubmittingFinal(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTrack,
          targetWeeks,
          targetDate: targetDate ? targetDate : null,
          diagnosticScores: diagnosticResult,
          compatibilityBreakdown: compatibilityResult,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate roadmap.");

      router.push(data.redirectUrl || "/roadmap");
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmittingFinal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Compass className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading career exploration...</p>
        </div>
      </div>
    );
  }

  // Workload compressed warning check
  let workloadCompressedWarning = "";
  if (targetDate) {
    const diffDays = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 42) {
      workloadCompressedWarning = `Notice: Target date allows only ${diffDays} days (< 6 weeks). Meeting this deadline will require more than the recommended 90 minutes/day.`;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Stepper Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            Phase 2: Career Onboarding
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Discover Your Ideal Career Track
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Explore software career paths, assess your starting baseline, and generate a personalized 90-minute daily preparation roadmap.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/20"
                      : step > s
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 6 && (
                  <div
                    className={`h-0.5 w-6 sm:w-10 ${
                      step > s ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ================= STEP 1: WELCOME & ACADEMIC CONFIRMATION ================= */}
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Welcome, {userProfile?.fullName}!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Please confirm your verified academic details before we begin the career exploration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">User ID</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">@{userProfile?.userId}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Email Address</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{userProfile?.email}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Enrolled Program</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {userProfile?.course} — {userProfile?.branch}
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Current Semester</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Semester {userProfile?.semester}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <strong>How CareerOrbit Works:</strong>
                <p className="mt-1">
                  We don&apos;t just ask you to pick a track blindly. You&apos;ll explore 3 core tracks side-by-side, take a transparent compatibility evaluation, test your baseline skills, and generate a daily 90-minute roadmap tailored to your timeline.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
              >
                Explore Career Tracks <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SIDE-BY-SIDE CAREER EXPLORATION ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold">Side-by-Side Career Comparison</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Examine all three core career pathways before taking your compatibility assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Software Engineer Card */}
              <div className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {CAREER_TRACKS.SOFTWARE_ENGINEER.title}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {CAREER_TRACKS.SOFTWARE_ENGINEER.tagline}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                    {CAREER_TRACKS.SOFTWARE_ENGINEER.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Core Skills
                    </span>
                    <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {CAREER_TRACKS.SOFTWARE_ENGINEER.coreSkills.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                    <strong>Supported Languages:</strong>{" "}
                    {CAREER_TRACKS.SOFTWARE_ENGINEER.supportedLanguages.join(", ")}
                  </div>
                </div>
              </div>

              {/* Web Developer Card */}
              <div className="bg-white dark:bg-zinc-900 border border-cyan-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {CAREER_TRACKS.WEB_DEVELOPER.title}
                  </h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-1">
                    {CAREER_TRACKS.WEB_DEVELOPER.tagline}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                    {CAREER_TRACKS.WEB_DEVELOPER.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Core Skills
                    </span>
                    <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {CAREER_TRACKS.WEB_DEVELOPER.coreSkills.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                    <strong>Supported Languages:</strong>{" "}
                    {CAREER_TRACKS.WEB_DEVELOPER.supportedLanguages.join(", ")}
                  </div>
                </div>
              </div>

              {/* Data Analyst Card */}
              <div className="bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {CAREER_TRACKS.DATA_ANALYST.title}
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                    {CAREER_TRACKS.DATA_ANALYST.tagline}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                    {CAREER_TRACKS.DATA_ANALYST.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Core Skills
                    </span>
                    <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {CAREER_TRACKS.DATA_ANALYST.coreSkills.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                    <strong>Supported Languages:</strong>{" "}
                    {CAREER_TRACKS.DATA_ANALYST.supportedLanguages.join(", ")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
              >
                Take Compatibility Questionnaire <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: QUESTIONNAIRE & SKILL SELF-ASSESSMENT ================= */}
        {step === 3 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Preferences & Skill Self-Assessment</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Answer these 6 questions about your problem-solving style and rate your current comfort with key tools.
              </p>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {CAREER_QUESTIONNAIRE.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Question {idx + 1} of {CAREER_QUESTIONNAIRE.length}</span>
                    <span>•</span>
                    <span>{q.category}</span>
                  </div>
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {q.prompt}
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          answers[q.id] === opt.id
                            ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm leading-relaxed">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Ratings Matrix */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold">Skill Self-Assessment</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rate your current familiarity with each language/technology (1 = Beginner, 5 = Highly Confident).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_SKILLS.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{skill.label}</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Level {skillRatings[skill.id] || 1}/5
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={skillRatings[skill.id] || 1}
                      onChange={(e) =>
                        setSkillRatings({
                          ...skillRatings,
                          [skill.id]: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
              >
                Take Diagnostic Baseline <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: DIAGNOSTIC ASSESSMENT ================= */}
        {step === 4 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Baseline Knowledge Check
              </div>
              <h2 className="text-2xl font-bold">Diagnostic Skill Assessment</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Answer these 6 quick baseline questions. These test your current starting point to personalize recommendations.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong>Academic Notice:</strong> Diagnostic results guide your preparation and identify skill gaps. They will not block you from pursuing any track.
              </span>
            </div>

            <div className="space-y-6">
              {diagnosticQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <span>Question {idx + 1} of {diagnosticQuestions.length}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {q.skillLabel} • {q.topic}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                    {q.prompt}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt: any) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          diagnosticSubmissions[q.id] === opt.id
                            ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`diag_${q.id}`}
                          checked={diagnosticSubmissions[q.id] === opt.id}
                          onChange={() =>
                            setDiagnosticSubmissions({
                              ...diagnosticSubmissions,
                              [q.id]: opt.id,
                            })
                          }
                          className="mt-0.5 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs leading-relaxed">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleEvaluateDiagnostic}
                disabled={isEvaluatingDiag}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium shadow-md transition"
              >
                {isEvaluatingDiag ? "Evaluating Answers..." : "Submit Diagnostic & View Results"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: COMPATIBILITY RESULTS & TRACK SELECTION ================= */}
        {step === 5 && compatibilityResult && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Transparent Compatibility Breakdown
              </div>
              <h2 className="text-2xl font-bold">Your Career Compatibility Scores</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Here is how your preferences, self-assessments, and diagnostic answers mapped to each track.
              </p>
            </div>

            {/* Disclaimer Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong>Guidance Notice:</strong> {compatibilityResult.guidanceDisclaimer}
              </div>
            </div>

            {/* Diagnostic Summary Badge */}
            {diagnosticResult && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-purple-900 dark:text-purple-300">
                    Diagnostic Starting Baseline: Level {diagnosticResult.startingLevel} ({diagnosticResult.percentageScore}%)
                  </span>
                  <p className="text-purple-700 dark:text-purple-400 mt-0.5">
                    {diagnosticResult.correctAnswers} of {diagnosticResult.totalQuestions} baseline questions correct.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-200 dark:bg-purple-800/50 text-purple-900 dark:text-purple-200 font-medium">
                    {diagnosticResult.gaps.length} Skill Gaps Identified
                  </span>
                </div>
              </div>
            )}

            {/* Track Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"] as TrackKey[]).map((t) => {
                const breakdown = compatibilityResult.breakdowns[t];
                const isSelected = selectedTrack === t;

                return (
                  <div
                    key={t}
                    onClick={() => setSelectedTrack(t)}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          {breakdown.recommendationLevel.replace("_", " ")}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold">{breakdown.trackTitle}</h3>

                      {/* Score Indicator */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                          {breakdown.score}%
                        </span>
                        <span className="text-xs text-zinc-500">Compatibility</span>
                      </div>

                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${breakdown.score}%` }}
                        />
                      </div>

                      {/* Contributing Factors */}
                      <div className="mt-5 space-y-2">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          Contributing Factors:
                        </span>
                        <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                          {breakdown.contributingFactors.slice(0, 2).map((factor: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Q-Points: {breakdown.questionnairePoints}/60</span>
                      <span className="text-zinc-500">Skills: {breakdown.skillPoints}/40</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
              >
                Set Timeline & Daily Target <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: PREPARATION TIMELINE & ROADMAP GENERATION ================= */}
        {step === 6 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Preparation Timeline & Daily Schedule</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Customize your roadmap duration. CareerOrbit standardizes a sustainable 90-minute daily preparation target.
              </p>
            </div>

            {/* Selected Track Confirmation */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500">Selected Track</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {CAREER_TRACKS[selectedTrack].title}
                </p>
              </div>
              <button
                onClick={() => setStep(5)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Change Track
              </button>
            </div>

            {/* Target Duration Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-900 dark:text-white">
                Choose Recommended Preparation Duration:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[8, 12, 16, 24].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setTargetWeeks(w);
                      setTargetDate("");
                    }}
                    className={`p-4 rounded-2xl border text-center transition ${
                      targetWeeks === w && !targetDate
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-bold"
                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="text-xl block">{w} Weeks</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {w === 12 ? "Recommended" : `${w * 6 * 1.5} total hrs`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Specific Target Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Or Select a Specific Target Deadline:
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full sm:w-72 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white"
              />
            </div>

            {/* Workload Warning Notice */}
            {workloadCompressedWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{workloadCompressedWarning}</span>
              </div>
            )}

            {/* 90-Minute Daily Breakdown Guarantee */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-3">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                90-Minute Daily Preparation Structure
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Each day in your personalized roadmap allocates:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <span className="font-bold text-blue-600 dark:text-blue-400">35 Minutes</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Core In-App Concept Learning & Verified Docs</p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <span className="font-bold text-blue-600 dark:text-blue-400">35 Minutes</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Hands-On Practice & Implementation</p>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <span className="font-bold text-blue-600 dark:text-blue-400">20 Minutes</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Daily Assessment (60% Passing Threshold)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                disabled={isSubmittingFinal}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-lg transition"
              >
                {isSubmittingFinal ? (
                  <>Generating Your Roadmap...</>
                ) : (
                  <>
                    Confirm & Launch My Roadmap <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

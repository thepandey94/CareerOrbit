import React from "react";
import Link from "next/link";
import { 
  Code, 
  Terminal, 
  BarChart3, 
  BookOpen, 
  Brain, 
  Video, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Award,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" /> Structured Career Preparation
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Your Journey. Your Skills. <span className="text-blue-600 dark:text-blue-400">Your Career.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CareerOrbit guides students from diagnostic self-assessment to placement readiness through personalized roadmaps, sandboxed technical challenges, and AI-evaluated communication sessions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              Start Free Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold border rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Core Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Real Verification</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified OTP delivery & authentic evaluations with zero fabricated scores.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">90-Min Daily Targets</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adaptive curriculum tailored to your personal target completion date.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
              <Terminal className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Isolated Sandbox</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Safe, sandboxed Java and Python execution with secret test protection.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Readiness Metric</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transparent formula combining Tech (40%), Aptitude (30%), & Comm (30%).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Tracks Section */}
      <section id="tracks" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Supported Career Tracks
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore tracks side-by-side. Our transparent diagnostic assessment analyzes your skill gaps without restricting your career choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Software Engineer */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Software Engineer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Focus on core programming, data structures, algorithms, problem-solving, and clean software architecture.
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Core Technologies</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Java</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Python</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">C++</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">DSA</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="mt-6 w-full py-2.5 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            >
              Explore SWE Track
            </Link>
          </div>

          {/* Web Developer */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Web Developer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Master modern frontend interfaces, semantic HTML, responsive CSS, JavaScript, and dynamic client-server communication.
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Core Technologies</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">JavaScript</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">HTML5</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">CSS3</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Web APIs</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="mt-6 w-full py-2.5 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            >
              Explore Web Track
            </Link>
          </div>

          {/* Data Analyst */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Data Analyst</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Learn relational data querying, aggregation, statistical analysis, and Python-based analytical pipelines.
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Core Technologies</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">SQL</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Python</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Analytics</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Data Modeling</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="mt-6 w-full py-2.5 text-center text-sm font-semibold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
            >
              Explore Data Track
            </Link>
          </div>
        </div>
      </section>

      {/* The 4 Main Modules */}
      <section id="modules" className="py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Comprehensive 4-Pillar Preparation
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every round evaluated with testable rubrics, authentic timers, and objective thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Roadmap & Learning</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Step-by-step daily tasks structured around a 90-minute study goal. Tasks stay locked until prerequisite assessments are verified at 60%+ mastery. An interactive AI Study Tutor provides step-by-step explanations and debugging hints without spoiling answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Technical Round & Playground</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                25-question timed round consisting of 15 conceptual questions, 5 debugging questions, and 5 coding problems. Evaluated against secret test cases inside an isolated sandbox. Includes a standalone practice playground.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Aptitude Module</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                25 timed questions balanced across Quantitative Aptitude (10), Logical Reasoning (8), and Verbal Ability (7). Detailed weak-topic breakdowns identify exact areas for revision.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">4. Communication & Presentation</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                5-minute preparation followed by up to 7 minutes of webcam presentation. Evaluated on speech pace, clarity, vocabulary, grammar, and engagement. Raw video recordings are immediately and permanently erased after scoring to ensure privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Method & Integrity */}
      <section id="method" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Scoring Integrity & Transparent Evaluation
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Career readiness is a measurable process, not guesswork.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">The CareerOrbit Readiness Formula</h3>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              Overall Score = (Technical × 0.40) + (Aptitude × 0.30) + (Communication × 0.30)
            </span>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Objective Threshold:</strong> Each assessment module requires a 60% passing mark to unlock the next level.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Incomplete Integrity:</strong> If any round is unattempted, the overall readiness score displays as "Incomplete" rather than treating missing rounds as zero.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><strong>No Fabrications:</strong> We never manufacture placement guarantees, corporate partnerships, or simulated pass marks.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-t from-blue-600/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Ready to Begin Your Preparation?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Sign up with your academic email address and receive your diagnostic compatibility breakdown in minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound, User, Lock, BookOpen, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [course, setCourse] = useState("B.Tech / B.E.");
  const [customCourse, setCustomCourse] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [customBranch, setCustomBranch] = useState("");
  const [semester, setSemester] = useState(5);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // Validation & UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userIdStatus, setUserIdStatus] = useState<{ available?: boolean; error?: string; suggestions?: string[] } | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      setSuccessMessage("Verification code dispatched! Please check your email.");
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      setSuccessMessage("Email verified! Complete your student profile below.");
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check User ID live
  const checkUserIdLive = async (val: string) => {
    setUserId(val);
    if (val.trim().length < 3) {
      setUserIdStatus(null);
      return;
    }

    try {
      const res = await fetch(`/api/auth/check-user-id?userId=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      setUserIdStatus(data);
    } catch {
      // Ignore network errors during debounced check
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const finalCourse = course === "Other" ? customCourse : course;
    const finalBranch = branch === "Other" ? customBranch : branch;

    try {
      const res = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          course: finalCourse,
          branch: finalBranch,
          semester: Number(semester),
          userId,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration.");
      }

      // Registration complete: redirect to profile
      window.location.href = "/profile";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Step Indicator */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</div>
            <div className={`h-1 w-8 ${step >= 2 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</div>
            <div className={`h-1 w-8 ${step >= 3 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>3</div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Complete Student Profile"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1 && "Enter your email address to receive a 6-digit verification code."}
            {step === 2 && `We sent a 6-digit code to ${email}.`}
            {step === 3 && "Select your academic discipline, unique User ID, and a secure password."}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && !error && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? "Sending Code..." : "Send Verification Code"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="otp-input">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-base tracking-widest font-mono bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Code valid for 10 minutes.</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2 px-3 text-sm font-medium border rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Email
              </button>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-2/3 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4 text-left">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="name-input">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Course & Branch */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="course-select">
                  Course
                </label>
                <select
                  id="course-select"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc CS/IT">B.Sc CS/IT</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="semester-select">
                  Semester
                </label>
                <select
                  id="semester-select"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {course === "Other" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-course-input">
                  Specify Course
                </label>
                <input
                  id="custom-course-input"
                  type="text"
                  required
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="e.g. Integrated M.Sc"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="branch-select">
                Branch / Major
              </label>
              <select
                id="branch-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {branch === "Other" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-branch-input">
                  Specify Branch
                </label>
                <input
                  id="custom-branch-input"
                  type="text"
                  required
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  placeholder="e.g. Electrical Engineering"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>
            )}

            {/* User ID */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="userid-input">
                Choose Unique User ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">@</span>
                <input
                  id="userid-input"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => checkUserIdLive(e.target.value)}
                  placeholder="alex_mercer"
                  className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {userIdStatus && (
                <div className="mt-1 text-xs">
                  {userIdStatus.available ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> @{userId} is available!
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-red-500">{userIdStatus.error}</span>
                      {userIdStatus.suggestions && userIdStatus.suggestions.length > 0 && (
                        <div className="flex gap-1.5 items-center">
                          <span className="text-slate-400">Suggestions:</span>
                          {userIdStatus.suggestions.map((sug) => (
                            <button
                              type="button"
                              key={sug}
                              onClick={() => checkUserIdLive(sug)}
                              className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[11px] underline"
                            >
                              @{sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="password-input">
                Strong Password (min. 12 characters)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="password-input"
                  type="password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must include uppercase, lowercase, and numeric characters.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || userIdStatus?.available === false}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors mt-2"
            >
              {isLoading ? "Creating Account..." : "Complete Registration & Launch"}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

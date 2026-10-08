"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, BookOpen, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  userId: string;
  fullName: string;
  course: string;
  branch: string;
  semester: number;
  role: string;
  userIdChangedAt?: string | null;
  accountStatus: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState(1);

  // User ID change
  const [newUserId, setNewUserId] = useState("");
  const [isChangingUserId, setIsChangingUserId] = useState(false);

  // Account deletion
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setFullName(data.user.fullName);
        setCourse(data.user.course);
        setBranch(data.user.branch);
        setSemester(data.user.semester);
      }
    } catch {
      setError("Failed to load user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, course, branch, semester }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed.");

      setMessage("Profile successfully updated.");
      fetchProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating profile.");
    }
  };

  const handleChangeUserId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingUserId(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/user/change-user-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUserId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "User ID change rejected.");

      setMessage("User ID successfully changed!");
      setNewUserId("");
      fetchProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error changing User ID.");
    } finally {
      setIsChangingUserId(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Account deletion request failed.");

      window.location.href = `/account-pending-deletion?identifier=${encodeURIComponent(user?.email || "")}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initiate deletion.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-sm font-medium text-slate-500 animate-pulse">Loading student profile...</div>
      </div>
    );
  }

  // Calculate 90-day cooldown status
  let daysRemainingInCooldown = 0;
  if (user?.userIdChangedAt) {
    const elapsed = Date.now() - new Date(user.userIdChangedAt).getTime();
    const cooldownMs = 90 * 24 * 60 * 60 * 1000;
    if (elapsed < cooldownMs) {
      daysRemainingInCooldown = Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header & Badges */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{user?.fullName}</span>
            <span className="text-sm font-normal text-blue-600 dark:text-blue-400 font-mono">@{user?.userId}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>{user?.course}</span> • <span>{user?.branch}</span> • <span>Semester {user?.semester}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {user?.role}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Edit Profile Details */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Academic Details
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="edit-name">
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="edit-course">
                  Course
                </label>
                <input
                  id="edit-course"
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="edit-semester">
                  Semester
                </label>
                <select
                  id="edit-semester"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="edit-branch">
                Branch / Major
              </label>
              <input
                id="edit-branch"
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Profile Updates
            </button>
          </form>
        </div>

        {/* Section 2: User ID Change & Cooldown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Unique User ID
          </h2>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p><strong>Current User ID:</strong> @{user?.userId}</p>
            <p><strong>Policy:</strong> Permitted once every 90 days. Enforced on the server.</p>
            {daysRemainingInCooldown > 0 ? (
              <p className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5" /> Next change available in {daysRemainingInCooldown} days.
              </p>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eligible to change User ID.
              </p>
            )}
          </div>

          <form onSubmit={handleChangeUserId} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="new-userid">
                New User ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">@</span>
                <input
                  id="new-userid"
                  type="text"
                  required
                  disabled={daysRemainingInCooldown > 0}
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="new_user_handle"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingUserId || daysRemainingInCooldown > 0 || !newUserId}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isChangingUserId ? "Validating..." : "Request User ID Change"}
            </button>
          </form>
        </div>
      </div>

      {/* Section 3: Dangerous Actions (14-Day Account Deletion) */}
      <div className="p-6 rounded-2xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20 space-y-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" /> Account Deletion (14-Day Grace Period)
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Deleting your account immediately locks your preparation dashboard. You will enter a <strong>14-day grace period</strong> during which you can log in to cancel deletion and restore your progress. After 14 days, all personal records and files are permanently purged.
        </p>

        <form onSubmit={handleDeleteAccount} className="max-w-md space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="delete-confirm-password">
              Confirm Password to Initiate 14-Day Deletion
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="delete-confirm-password"
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isDeleting || !deletePassword}
            className="py-2 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {isDeleting ? "Scheduling Deletion..." : "Schedule Account Deletion (14 Days)"}
          </button>
        </form>
      </div>
    </div>
  );
}

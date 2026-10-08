"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Compass, User, LogOut, Menu, X, ShieldAlert, Code2, Brain, Terminal, Video, LayoutDashboard } from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  userId: string;
  fullName: string;
  role: "STUDENT" | "ADMIN";
}

export function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check active session via API
    fetch("/api/user/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Unauthenticated visitor
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-slate-900 dark:text-white">Career<span className="text-blue-600 dark:text-blue-400">Orbit</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Career Tracks
          </Link>
          <Link href="/#modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Modules
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/roadmap" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1">
                <Compass className="w-4 h-4" /> Roadmap
              </Link>
              <Link href="/technical" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1">
                <Code2 className="w-4 h-4 text-indigo-500" /> Technical
              </Link>
              <Link href="/aptitude" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1">
                <Brain className="w-4 h-4 text-blue-500" /> Aptitude
              </Link>
              <Link href="/communication" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold flex items-center gap-1">
                <Video className="w-4 h-4 text-purple-500" /> Interview
              </Link>
              <Link href="/playground" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1">
                <Terminal className="w-4 h-4 text-emerald-500" /> Playground
              </Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline">
              <ShieldAlert className="w-4 h-4" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Action Controls & User Status */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>@{user.userId}</span>
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-b px-4 py-4 space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Link
            href="/#tracks"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Career Tracks
          </Link>
          <Link
            href="/#modules"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Preparation Modules
          </Link>
          <Link
            href="/#method"
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Our Method
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-semibold text-amber-600 dark:text-amber-400"
            >
              Admin Portal
            </Link>
          )}

          <hr className="border-slate-200 dark:border-slate-800 my-2" />

          {user ? (
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                Student Dashboard
              </Link>
              <Link
                href="/roadmap"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                My Roadmap
              </Link>
              <Link
                href="/technical"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                Technical Round (25 Qs)
              </Link>
              <Link
                href="/aptitude"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-blue-600 dark:text-blue-400"
              >
                Aptitude Assessment (25 Qs)
              </Link>
              <Link
                href="/communication"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-purple-600 dark:text-purple-400"
              >
                Interview & Communication (7-Min)
              </Link>
              <Link
                href="/playground"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-emerald-600 dark:text-emerald-400"
              >
                Code Playground (Java & Python)
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Career Exploration
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Profile (@{user.userId})
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                className="block w-full text-left text-sm font-medium text-red-600 dark:text-red-400"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium border rounded-lg border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

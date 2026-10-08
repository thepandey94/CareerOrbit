"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-slate-900 dark:text-white">CareerOrbit</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
              “Your journey. Your skills. Your career.”
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              An AI-assisted, structured career-preparation platform built for students. 
              Objective assessments, verified skill roadmaps, and genuine preparation tracking.
            </p>
          </div>

          {/* Supported Tracks */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Career Tracks
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Software Engineer (Java, Python, DSA)</li>
              <li>Web Developer (JavaScript, HTML/CSS)</li>
              <li>Data Analyst (SQL, Python, Analytics)</li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Modules
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Roadmaps & Learning</li>
              <li>Technical Rounds & Playground</li>
              <li>Aptitude Assessments</li>
              <li>Communication & Presentation</li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-slate-200 dark:border-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <p>© 2026 CareerOrbit. Real preparation with real accountability.</p>
          <div className="flex gap-4">
            <Link href="/#method" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Scoring Integrity
            </Link>
            <Link href="/#tracks" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Tracks
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

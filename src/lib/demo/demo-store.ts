/**
 * CareerOrbit — Lightweight Local Demo Data Store
 * Provides self-contained, offline-resilient sample data for hackathon demonstrations.
 * Used when DEMO_MODE is active or when external database services are unreachable.
 */

export interface DemoUser {
  id: string;
  email: string;
  userId: string;
  fullName: string;
  course: string;
  branch: string;
  semester: number;
  role: "STUDENT" | "ADMIN";
  accountStatus: "ACTIVE" | "PENDING_DELETION";
}

export interface DemoTask {
  id: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  description: string;
  taskType: "LEARNING" | "PRACTICE" | "ASSESSMENT";
  durationMinutes: number;
  status: "LOCKED" | "AVAILABLE" | "COMPLETED";
  completedAt?: string | null;
  prerequisites: string[];
}

export interface DemoQuestion {
  id: string;
  track: "SOFTWARE_ENGINEER" | "WEB_DEVELOPER" | "DATA_ANALYST";
  topic: string;
  questionType: "CONCEPTUAL" | "CODING_PROBLEM" | "DEBUGGING";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prompt: string;
  options?: string[];
  correctOption?: string;
  starterCode?: Record<string, string>;
  sampleTestCases?: Array<{ input: string; expectedOutput: string }>;
  solutionExplanation: string;
}

// 1. Initial Pre-seeded Demo Users
const DEFAULT_STUDENT: DemoUser = {
  id: "demo-student-id-001",
  email: "student@careerorbit.dev",
  userId: "student_orbit",
  fullName: "CareerOrbit Student",
  course: "B.Tech",
  branch: "Computer Science & Engineering",
  semester: 6,
  role: "STUDENT",
  accountStatus: "ACTIVE",
};

const DEFAULT_ADMIN: DemoUser = {
  id: "demo-admin-id-001",
  email: "admin@careerorbit.dev",
  userId: "admin_orbit",
  fullName: "CareerOrbit Administrator",
  course: "Administration",
  branch: "System Operations",
  semester: 1,
  role: "ADMIN",
  accountStatus: "ACTIVE",
};

// 2. Demo Questions Bank
const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "q-dsa-1",
    track: "SOFTWARE_ENGINEER",
    topic: "Data Structures & Algorithms",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctOption: "O(log n)",
    solutionExplanation: "A balanced BST divides the search space in half at each step, yielding logarithmic search complexity.",
  },
  {
    id: "q-dsa-2",
    track: "SOFTWARE_ENGINEER",
    topic: "Two Pointers & Arrays",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n  return [0, 1];\n}",
      python: "def two_sum(nums, target):\n    # Your code here\n    return [0, 1]",
    },
    sampleTestCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
    ],
    solutionExplanation: "Use a hash map to store complements in single pass O(n) time.",
  },
  {
    id: "q-web-1",
    track: "WEB_DEVELOPER",
    topic: "Web Architecture & Security",
    questionType: "CONCEPTUAL",
    difficulty: "MEDIUM",
    prompt: "Which HTTP header is primarily used to prevent Clickjacking attacks in modern browsers?",
    options: ["X-Frame-Options", "X-XSS-Protection", "Strict-Transport-Security", "Access-Control-Allow-Origin"],
    correctOption: "X-Frame-Options",
    solutionExplanation: "X-Frame-Options (or CSP frame-ancestors) instructs the browser whether the site can be rendered inside a frame.",
  },
  {
    id: "q-data-1",
    track: "DATA_ANALYST",
    topic: "SQL & Relational Analytics",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which SQL clause is used to filter records resulting from an aggregate GROUP BY query?",
    options: ["WHERE", "HAVING", "LIMIT", "ORDER BY"],
    correctOption: "HAVING",
    solutionExplanation: "HAVING filters groups of rows created by GROUP BY, while WHERE filters individual rows before grouping.",
  },
];

// 3. Demo Tasks
const DEMO_TASKS: DemoTask[] = [
  {
    id: "task-1",
    weekNumber: 1,
    dayNumber: 1,
    title: "Time & Space Complexity Basics",
    description: "Master Big-O notation, asymptotic analysis, and common complexity classes.",
    taskType: "LEARNING",
    durationMinutes: 45,
    status: "COMPLETED",
    completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    prerequisites: [],
  },
  {
    id: "task-2",
    weekNumber: 1,
    dayNumber: 2,
    title: "Array Data Structure & Two-Pointer Technique",
    description: "Implement two-pointer algorithms for sorted arrays and subarray problems.",
    taskType: "PRACTICE",
    durationMinutes: 60,
    status: "COMPLETED",
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    prerequisites: ["task-1"],
  },
  {
    id: "task-3",
    weekNumber: 2,
    dayNumber: 1,
    title: "Hash Maps & Sliding Window Pattern",
    description: "Frequency counters, hash-based lookups, and fixed/variable sliding windows.",
    taskType: "PRACTICE",
    durationMinutes: 60,
    status: "AVAILABLE",
    prerequisites: ["task-2"],
  },
  {
    id: "task-4",
    weekNumber: 2,
    dayNumber: 2,
    title: "Linked List Reversal & Fast/Slow Pointers",
    description: "Singly linked list manipulation, cycle detection (Floyd algorithm), and in-place reversal.",
    taskType: "PRACTICE",
    durationMinutes: 60,
    status: "LOCKED",
    prerequisites: ["task-3"],
  },
  {
    id: "task-5",
    weekNumber: 3,
    dayNumber: 1,
    title: "Binary Trees & Traversal Techniques",
    description: "Depth-first (inorder, preorder, postorder) and breadth-first search on trees.",
    taskType: "LEARNING",
    durationMinutes: 50,
    status: "LOCKED",
    prerequisites: ["task-4"],
  },
];

class DemoStoreClass {
  private users: Map<string, DemoUser> = new Map();
  private otps: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor() {
    this.users.set(DEFAULT_STUDENT.email.toLowerCase(), DEFAULT_STUDENT);
    this.users.set(DEFAULT_STUDENT.userId.toLowerCase(), DEFAULT_STUDENT);
    this.users.set(DEFAULT_ADMIN.email.toLowerCase(), DEFAULT_ADMIN);
    this.users.set(DEFAULT_ADMIN.userId.toLowerCase(), DEFAULT_ADMIN);
  }

  // User Lookup
  findUserByIdentifier(identifier: string): DemoUser | null {
    const key = identifier.trim().toLowerCase();
    return this.users.get(key) || null;
  }

  // Create User
  createUser(params: Omit<DemoUser, "id" | "accountStatus">): DemoUser {
    const id = `demo-user-${Date.now()}`;
    const user: DemoUser = {
      ...params,
      id,
      accountStatus: "ACTIVE",
    };
    this.users.set(user.email.toLowerCase(), user);
    this.users.set(user.userId.toLowerCase(), user);
    return user;
  }

  // OTP Simulation
  generateOtp(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(email.trim().toLowerCase(), {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return code;
  }

  verifyOtp(email: string, code: string): boolean {
    const entry = this.otps.get(email.trim().toLowerCase());
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) return false;
    return entry.code === code.trim();
  }

  // Demo Dashboard Payload matching StudentDashboardPayload exactly
  getDashboardData(userId?: string) {
    const user = (userId ? this.findUserByIdentifier(userId) : null) || DEFAULT_STUDENT;
    return {
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        avatarUrl: null,
      },
      career: {
        selectedTrack: "SOFTWARE_ENGINEER",
        targetWeeks: 12,
        dailyMinutesTarget: 90,
        diagnosticScores: { dsa: 85, web: 72, systems: 78, problemSolving: 88 },
      },
      roadmap: {
        id: "demo-roadmap-1",
        title: "Software Engineer Preparation Roadmap",
        currentWeek: 2,
        currentDay: 2,
        totalTasks: DEMO_TASKS.length,
        completedTasks: DEMO_TASKS.filter((t) => t.status === "COMPLETED").length,
        availableTasks: DEMO_TASKS.filter((t) => t.status === "AVAILABLE").length,
        progressPercent: 50,
      },
      jobReadiness: {
        overallScore: 83,
        isComplete: true,
        technical: {
          score: 88,
          completed: true,
          weight: 0.4,
          status: "88%",
          passed: true,
          bestAttemptDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        aptitude: {
          score: 80,
          completed: true,
          weight: 0.3,
          status: "80%",
          passed: true,
          bestAttemptDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        communication: {
          score: 80,
          completed: true,
          weight: 0.3,
          status: "80%",
          passed: true,
          bestAttemptDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        missingComponents: [] as string[],
        readinessTier: "STRONG" as const,
        tierDescription: "Interview Ready (Strong Competency). Demonstrates solid aptitude across key interview dimensions.",
      },
      weakTopics: [
        {
          domain: "TECHNICAL" as const,
          topic: "Binary Search Trees & Heap Operations",
          reason: "Continue your daily 90-minute structured study path.",
          priority: "MEDIUM" as const,
          actionUrl: "/roadmap",
          actionLabel: "Resume Roadmap",
        },
        {
          domain: "APTITUDE" as const,
          topic: "Permutations & Combinations",
          reason: "Identified in recent diagnostic assessment.",
          priority: "LOW" as const,
          actionUrl: "/aptitude",
          actionLabel: "Practice Aptitude",
        },
      ],
      recentHistory: [
        {
          id: "demo-hist-1",
          type: "TECHNICAL" as const,
          title: "Technical Round (Level 1)",
          score: 22,
          maxScore: 25,
          passed: true,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "demo-hist-2",
          type: "APTITUDE" as const,
          title: "Aptitude Assessment (25 Qs)",
          score: 20,
          maxScore: 25,
          passed: true,
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: "demo-hist-3",
          type: "COMMUNICATION" as const,
          title: "Web Architecture Presentation",
          score: 80,
          maxScore: 100,
          passed: true,
          date: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
      ],
      gamification: {
        currentStreak: 5,
        longestStreak: 8,
        streakFreezeCount: 2,
        totalPoints: 1450,
        earnedBadges: [
          { id: "PROFILE_VERIFIED", title: "Identity Confirmed", description: "Completed full academic profile verification", icon: "ShieldCheck", earnedAt: new Date().toISOString() },
          { id: "FIRST_STREAK", title: "Consistency Spark", description: "Maintained active study streak for 3+ consecutive days", icon: "Flame", earnedAt: new Date().toISOString() },
          { id: "EXPLORER", title: "Track Explorer", description: "Completed career diagnostic assessment", icon: "Compass", earnedAt: new Date().toISOString() },
        ],
        allAvailableBadges: [
          { id: "PROFILE_VERIFIED", title: "Identity Confirmed", description: "Completed full academic profile verification", icon: "ShieldCheck" },
          { id: "FIRST_STREAK", title: "Consistency Spark", description: "Maintained active study streak for 3+ consecutive days", icon: "Flame" },
          { id: "EXPLORER", title: "Track Explorer", description: "Completed career diagnostic assessment", icon: "Compass" },
        ],
      },
      isDemoMode: true,
    };
  }

  // Demo Roadmap
  getRoadmapData() {
    return {
      id: "demo-roadmap-1",
      title: "Software Engineer Preparation Roadmap",
      track: "SOFTWARE_ENGINEER",
      currentWeek: 2,
      currentDay: 2,
      progressPercentage: 50,
      totalTasks: DEMO_TASKS.length,
      completedTasks: DEMO_TASKS.filter((t) => t.status === "COMPLETED").length,
      tasks: DEMO_TASKS,
      isDemoMode: true,
    };
  }

  // Demo Aptitude Overview
  getAptitudeOverview() {
    return {
      totalAttempts: 1,
      passedAttempts: 1,
      bestScore: 20,
      latestAttempt: {
        id: "demo-apt-1",
        level: 1,
        score: 20,
        totalQuestions: 25,
        passed: true,
        status: "SUBMITTED",
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      structure: {
        totalQuestions: 25,
        durationMinutes: 45,
        passingThresholdScore: 15,
        passingThresholdPercent: 60,
        distribution: [
          { section: "Quantitative Aptitude", count: 10, topics: "Percentages, Ratios, Time & Work" },
          { section: "Logical Reasoning", count: 8, topics: "Number Series, Syllogisms, Coding-Decoding" },
          { section: "Verbal Ability", count: 7, topics: "Vocabulary, Sentence Correction" },
        ],
      },
      isDemoMode: true,
    };
  }

  // Demo Communication Overview
  getCommunicationHistory() {
    return {
      submissions: [
        {
          id: "demo-comm-1",
          topicTitle: "Explain the Architecture of a Web Application",
          overallScore: 80,
          passed: true,
          durationSeconds: 240,
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
      ],
      stats: {
        totalAttempts: 1,
        passedCount: 1,
        passRatePercent: 100,
        averageScore: 80,
      },
      isDemoMode: true,
    };
  }

  // Demo Questions
  getQuestions() {
    return DEMO_QUESTIONS;
  }
}

export const demoStore = new DemoStoreClass();
export default demoStore;

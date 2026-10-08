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

  // Demo Dashboard Payload
  getDashboardData(userId: string) {
    const user = this.findUserByIdentifier(userId) || DEFAULT_STUDENT;
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        userId: user.userId,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        track: "SOFTWARE_ENGINEER",
        targetWeeks: 12,
        targetDate: new Date(Date.now() + 86400000 * 70).toISOString(),
      },
      readiness: {
        overallScore: 74,
        tier: "JOB_READY",
        tierDescription: "Strong foundational and practical capability. Suitable for entry-level and junior roles.",
        breakdown: {
          roadmapProgressPercent: 50,
          technicalScorePercent: 88,
          aptitudeScorePercent: 80,
          communicationScorePercent: 80,
        },
      },
      streak: {
        currentStreak: 5,
        longestStreak: 8,
        streakFreezeCount: 2,
        totalPoints: 350,
      },
      badges: [
        { id: "PROFILE_VERIFIED", title: "Identity Confirmed", description: "Completed full academic profile verification" },
        { id: "FIRST_STREAK", title: "Consistency Spark", description: "Maintained active study streak for 3+ consecutive days" },
        { id: "EXPLORER", title: "Track Explorer", description: "Completed career diagnostic assessment" },
      ],
      currentRoadmap: {
        id: "demo-roadmap-1",
        title: "Software Engineer Preparation Roadmap",
        track: "SOFTWARE_ENGINEER",
        currentWeek: 2,
        currentDay: 2,
        totalTasks: DEMO_TASKS.length,
        completedTasks: DEMO_TASKS.filter((t) => t.status === "COMPLETED").length,
        nextTask: DEMO_TASKS.find((t) => t.status === "AVAILABLE") || DEMO_TASKS[0],
      },
      recentAssessments: [
        { type: "TECHNICAL", title: "DSA & Problem Solving Round", score: 22, total: 25, passed: true, date: "2 days ago" },
        { type: "APTITUDE", title: "Quantitative & Analytical Aptitude", score: 20, total: 25, passed: true, date: "3 days ago" },
        { type: "COMMUNICATION", title: "Web Architecture Presentation", score: 80, total: 100, passed: true, date: "4 days ago" },
      ],
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
      tasks: DEMO_TASKS,
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

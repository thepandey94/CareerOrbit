export interface DiagnosticQuestion {
  id: string;
  skill: "java" | "python" | "javascript" | "sql" | "cpp" | "html_css";
  skillLabel: string;
  topic: string;
  prompt: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag_java_1",
    skill: "java",
    skillLabel: "Java",
    topic: "Object-Oriented Design & Memory",
    prompt: "In Java, what happens when a method receives an object reference as a parameter and reassigns that parameter variable to a new object using 'new'?",
    options: [
      { id: "a", text: "The caller's original object reference outside the method is changed to point to the new object." },
      { id: "b", text: "The parameter copy points to the new object, while the caller's original reference remains unchanged." },
      { id: "c", text: "A compilation error occurs because parameters in Java are strictly immutable by default." },
      { id: "d", text: "Both objects are merged together in the JVM heap space." },
    ],
    correctOptionId: "b",
    explanation:
      "Java is strictly pass-by-value. When an object reference is passed, a copy of the reference address is passed. Reassigning the parameter variable inside the method only changes the local copy, leaving the caller's reference unchanged.",
  },
  {
    id: "diag_python_1",
    skill: "python",
    skillLabel: "Python",
    topic: "Data Structures & Mutation",
    prompt: "In Python, what is the output of modifying a list that was passed as a default parameter value in a function across multiple calls?",
    options: [
      { id: "a", text: "A fresh empty list is initialized on every function invocation." },
      { id: "b", text: "The same list object persists and mutates across calls because default arguments are evaluated only once at definition time." },
      { id: "c", text: "Python raises an UnboundLocalError when mutating default arguments." },
      { id: "d", text: "The list is automatically deep-copied on every invocation." },
    ],
    correctOptionId: "b",
    explanation:
      "In Python, default arguments are evaluated once when the function is defined, not each time it is called. Using mutable default arguments like `def append_to(element, target=[])` causes the same list to be shared across calls.",
  },
  {
    id: "diag_js_1",
    skill: "javascript",
    skillLabel: "JavaScript",
    topic: "Asynchronous Execution & Event Loop",
    prompt: "In modern JavaScript, what order will `console.log('1')`, `setTimeout(() => console.log('2'), 0)`, and `Promise.resolve().then(() => console.log('3'))` execute?",
    options: [
      { id: "a", text: "1, 2, 3 (FIFO in order of registration)" },
      { id: "b", text: "1, 3, 2 (Synchronous code executes first, then microtasks from Promises, then macrotasks from setTimeout)" },
      { id: "c", text: "2, 1, 3" },
      { id: "d", text: "3, 2, 1" },
    ],
    correctOptionId: "b",
    explanation:
      "The JavaScript Event Loop processes synchronous call stack items first ('1'), then clears all microtasks in the microtask queue (Promise reactions -> '3'), and finally moves to the next macrotask in the macrotask queue (setTimeout callback -> '2').",
  },
  {
    id: "diag_sql_1",
    skill: "sql",
    skillLabel: "SQL",
    topic: "Relational Joins & Aggregations",
    prompt: "When querying an 'orders' table joined with a 'customers' table, which JOIN type guarantees that all customers appear in the result even if they have placed zero orders?",
    options: [
      { id: "a", text: "INNER JOIN" },
      { id: "b", text: "CROSS JOIN" },
      { id: "c", text: "LEFT JOIN (with 'customers' as the left table)" },
      { id: "d", text: "NATURAL JOIN" },
    ],
    correctOptionId: "c",
    explanation:
      "A LEFT JOIN returns all rows from the left table ('customers'), along with matched rows from the right table ('orders'). If no match exists, NULL values are populated for orders columns.",
  },
  {
    id: "diag_cpp_1",
    skill: "cpp",
    skillLabel: "C++",
    topic: "Memory Management & Pointers",
    prompt: "In modern C++, which smart pointer represents exclusive, unique ownership of a dynamically allocated resource that cannot be copied?",
    options: [
      { id: "a", text: "std::shared_ptr" },
      { id: "b", text: "std::weak_ptr" },
      { id: "c", text: "std::unique_ptr" },
      { id: "d", text: "std::auto_ptr" },
    ],
    correctOptionId: "c",
    explanation:
      "`std::unique_ptr` maintains sole ownership of an object and automatically deletes it when going out of scope. It cannot be copied (its copy constructor is deleted), but can be moved via `std::move`.",
  },
  {
    id: "diag_html_css_1",
    skill: "html_css",
    skillLabel: "HTML & CSS",
    topic: "Semantic Layout & CSS Box Model",
    prompt: "When `box-sizing: border-box` is declared on an HTML element, how is the total rendered width of the element calculated?",
    options: [
      { id: "a", text: "Total width = specified width + padding + border" },
      { id: "b", text: "Total width = specified width (padding and border are absorbed inside the specified width)" },
      { id: "c", text: "Total width = specified width + margin" },
      { id: "d", text: "Padding is ignored completely by the browser" },
    ],
    correctOptionId: "b",
    explanation:
      "With `box-sizing: border-box`, the element's specified width includes its content, padding, and borders. Extra padding or borders shrink the inner content area rather than expanding the element's overall outer box.",
  },
];

export interface DiagnosticSubmission {
  questionId: string;
  selectedOptionId: string;
}

export interface SkillGapAnalysis {
  skill: string;
  skillLabel: string;
  isStrengthened: boolean;
  topic: string;
  recommendation: string;
}

export interface DiagnosticResult {
  totalQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  startingLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  strengths: string[];
  gaps: SkillGapAnalysis[];
  detailedReview: {
    questionId: string;
    skill: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  constraintNotice: string;
}

export function evaluateDiagnosticAssessment(
  submissions: DiagnosticSubmission[]
): DiagnosticResult {
  let correctCount = 0;
  const strengths: string[] = [];
  const gaps: SkillGapAnalysis[] = [];
  const detailedReview: DiagnosticResult["detailedReview"] = [];

  for (const question of DIAGNOSTIC_QUESTIONS) {
    const sub = submissions.find((s) => s.questionId === question.id);
    const selectedOptionId = sub?.selectedOptionId || "";
    const isCorrect = selectedOptionId === question.correctOptionId;

    if (isCorrect) {
      correctCount++;
      strengths.push(`Solid grasp of ${question.skillLabel}: ${question.topic}`);
    } else {
      gaps.push({
        skill: question.skill,
        skillLabel: question.skillLabel,
        isStrengthened: false,
        topic: question.topic,
        recommendation: `Reinforce ${question.skillLabel} core principles, especially ${question.topic}.`,
      });
    }

    const userOpt = question.options.find((o) => o.id === selectedOptionId)?.text || "No answer";
    const correctOpt = question.options.find((o) => o.id === question.correctOptionId)?.text || "";

    detailedReview.push({
      questionId: question.id,
      skill: question.skill,
      prompt: question.prompt,
      userAnswer: userOpt,
      correctAnswer: correctOpt,
      isCorrect,
      explanation: question.explanation,
    });
  }

  const percentage = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100);
  let startingLevel: DiagnosticResult["startingLevel"] = "BEGINNER";
  if (percentage >= 80) startingLevel = "ADVANCED";
  else if (percentage >= 50) startingLevel = "INTERMEDIATE";

  return {
    totalQuestions: DIAGNOSTIC_QUESTIONS.length,
    correctAnswers: correctCount,
    percentageScore: percentage,
    startingLevel,
    strengths,
    gaps,
    detailedReview,
    constraintNotice:
      "Per CareerOrbit academic policy, diagnostic assessments estimate baseline proficiency to tailor your learning recommendations. Diagnostic results do not automatically pass future official assessments or bypass roadmap prerequisite stages.",
  };
}

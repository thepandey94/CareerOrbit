import { GoogleGenAI } from "@google/genai";
import { env } from "../env";
import { CareerTrackType } from "../onboarding/scoring";

export interface TutorPromptRequest {
  studentQuestion: string;
  track?: CareerTrackType;
  topic?: string;
  inAppContentContext?: string;
  isActiveAssessment?: boolean;
}

export interface TutorResponse {
  answer: string;
  provider: "gemini" | "verified-content-fallback";
  guardrailTriggered: boolean;
  model?: string;
}

// Patterns indicative of asking for test answers or cheating
const CHEATING_QUERY_PATTERNS = [
  /answer\s+to\s+(question|q\d|test|exam|assessment)/i,
  /give\s+me\s+the\s+(answer|option|solution\s+to\s+test)/i,
  /which\s+option\s+is\s+correct/i,
  /what\s+is\s+the\s+correct\s+option/i,
  /solve\s+this\s+(exam|test|assessment|question\s+\d)/i,
  /tell\s+me\s+if\s+it's\s+[a-d]/i,
  /cheat|pass\s+the\s+test\s+for\s+me/i,
];

export function checkCheatingGuardrail(
  question: string,
  isActiveAssessment?: boolean
): { shouldRefuse: boolean; refusalMessage?: string } {
  const isAskingForAnswers = CHEATING_QUERY_PATTERNS.some((pattern) =>
    pattern.test(question)
  );

  if (isActiveAssessment || isAskingForAnswers) {
    return {
      shouldRefuse: true,
      refusalMessage:
        "I am your dedicated CareerOrbit Study Tutor! Per academic integrity standards, I cannot reveal direct answers, correct options, or complete solutions for active assessments. However, once you complete this assessment, I would be delighted to break down the underlying concepts, review your results step-by-step, and explain where you can improve!",
    };
  }

  return { shouldRefuse: false };
}

/**
 * Deterministic verified-content fallback tutor that runs when
 * the Gemini API key is unconfigured, rate-limited, or offline.
 */
export function getVerifiedContentFallback(
  studentQuestion: string,
  topic?: string,
  track?: CareerTrackType,
  context?: string
): string {
  const qLower = studentQuestion.toLowerCase();

  if (qLower.includes("big-o") || qLower.includes("complexity") || qLower.includes("time complexity")) {
    return `### Study Tutor: Understanding Computational Complexity
Big-O measures the growth rate of runtime operations as the input size $N$ increases, independent of machine hardware:

1. **O(1) Constant:** Index lookup in an array (\`arr[i]\`) or key lookup in a HashMap.
2. **O(log N) Logarithmic:** Cutting the search space in half repeatedly (e.g., Binary Search).
3. **O(N) Linear:** Single loop over elements from 0 to N.
4. **O(N log N) Linearithmic:** Optimal comparison sorting (Merge Sort, Quick Sort).
5. **O(N²) Quadratic:** Nested iteration comparing every item against every other item.

*Mentor Tip:* Always identify the operation inside the deepest loop and ask: "How many times does this line execute in terms of N?"`;
  }

  if (qLower.includes("two pointer") || qLower.includes("array") || qLower.includes("reverse")) {
    return `### Study Tutor: The Two-Pointer Strategy
The Two-Pointer technique optimizes nested loops from $O(N^2)$ down to $O(N)$ with $O(1)$ extra memory.

**How it works:**
- **Opposite Direction:** One pointer starts at index \`0\` (left), and another starts at \`arr.length - 1\` (right). When searching for a target sum in a sorted array, if \`arr[left] + arr[right] < target\`, increment \`left\` to increase the sum. If the sum is too large, decrement \`right\`.
- **Same Direction (Fast/Slow):** Fast pointer inspects every incoming element, while the slow pointer writes only unique elements in-place.

*Mentor Tip:* Always verify whether the input array is sorted first! Two-pointer navigation relies on predictable ordering.`;
  }

  if (qLower.includes("flexbox") || qLower.includes("css") || qLower.includes("box model") || qLower.includes("semantic")) {
    return `### Study Tutor: Modern Web Layout Principles
1. **The Box Model:** Every element has Content, Padding (spacing inside border), Border, and Margin (spacing outside border). Always use \`box-sizing: border-box\` so padding doesn't cause unexpected horizontal scrollbars.
2. **Flexbox Coordinate Space:**
   - **Main Axis:** Controlled by \`justify-content\` (e.g., \`space-between\`, \`center\`).
   - **Cross Axis:** Controlled by \`align-items\` (e.g., \`center\`, \`stretch\`).
3. **Semantic HTML5:** Always use native \`<button>\` instead of \`<div onClick>\` so screen reader users and keyboard users can navigate your interface smoothly via the Tab and Enter keys.`;
  }

  if (qLower.includes("sql") || qLower.includes("join") || qLower.includes("select") || qLower.includes("null")) {
    return `### Study Tutor: Relational Database & SQL Logic
1. **Execution Sequence:** Remember that SQL runs in declarative order: \`FROM\` & \`JOIN\` resolve tables first, \`WHERE\` filters rows before grouping, and \`SELECT\` runs near the end.
2. **Join Visualizations:**
   - \`INNER JOIN\`: Intersection—only returns rows with matching keys in both tables.
   - \`LEFT JOIN\`: Retains ALL rows from the left table, inserting \`NULL\` if no match exists on the right.
3. **NULL Safety:** Always use \`IS NULL\` instead of \`= NULL\` because \`NULL = NULL\` evaluates to UNKNOWN in SQL three-valued logic.`;
  }

  // General helpful contextual fallback
  return `### Study Tutor Guidance
Here is a breakdown of your question on **${topic || track || "software engineering"}**:

${context ? `> **Key Concept:** ${context.slice(0, 300)}...\n\n` : ""}
**Step-by-step guidance:**
1. **Core Principle:** Break the problem down into inputs, required transformations, and expected outputs.
2. **Check Your Invariants:** Make sure you verify edge cases (empty inputs, null values, single element arrays, or zero rows).
3. **Trace It Manually:** Walk through an example with pencil and paper before writing code.

*If you would like a deeper explanation, try asking: "Can you give me a real-world analogy for this?" or "What are the common pitfalls to avoid?"*`;
}

export async function askStudyTutor(params: TutorPromptRequest): Promise<TutorResponse> {
  const { studentQuestion, track, topic, inAppContentContext, isActiveAssessment } = params;

  // 1. Guardrail Check: Protect active assessment integrity
  const guardrail = checkCheatingGuardrail(studentQuestion, isActiveAssessment);
  if (guardrail.shouldRefuse) {
    return {
      answer: guardrail.refusalMessage!,
      provider: "verified-content-fallback",
      guardrailTriggered: true,
    };
  }

  // 2. Try Gemini API if key is present
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const systemInstruction = `You are the CareerOrbit AI Study Tutor, an encouraging, patient, and precise technical mentor for college students preparing for careers in ${track || "Software Engineering"}.
Current Topic: ${topic || "Computer Science Fundamentals"}.

Guiding Principles:
1. Explain concepts using simple language, real-world analogies, and clear, step-by-step examples.
2. Provide concise code snippets (Java, Python, JavaScript, SQL, C++) when helpful.
3. NEVER write full homework or cheat solutions. Teach students how to think through the problem.
4. Tone: Friendly, professional, clear, and inspiring. Keep responses focused under 350 words.`;

      const prompt = `Context from student's active lesson:
${inAppContentContext ? inAppContentContext.slice(0, 1000) : "General study assistance"}

Student's Question:
${studentQuestion}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (responseText && responseText.trim().length > 0) {
        return {
          answer: responseText,
          provider: "gemini",
          guardrailTriggered: false,
          model: "gemini-2.5-flash",
        };
      }
    } catch (err) {
      console.warn("[CareerOrbit AI Tutor] Gemini API unavailable or failed, falling back to verified knowledge base:", err);
      // Seamlessly fall through to deterministic verified content fallback
    }
  }

  // 3. Deterministic Verified Content Fallback
  const fallbackAnswer = getVerifiedContentFallback(
    studentQuestion,
    topic,
    track,
    inAppContentContext
  );

  return {
    answer: fallbackAnswer,
    provider: "verified-content-fallback",
    guardrailTriggered: false,
  };
}

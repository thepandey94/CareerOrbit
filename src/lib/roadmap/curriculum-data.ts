import { CareerTrackType } from "../onboarding/scoring";

export interface CuratedResourceItem {
  title: string;
  url: string;
  resourceType: "DOCUMENTATION" | "TUTORIAL" | "VIDEO" | "SPECIFICATION";
  isVerified: boolean;
}

export interface DayCurriculum {
  dayNumber: number;
  dayTitle: string;
  topics: string[];
  learning: {
    title: string;
    description: string;
    durationMinutes: number;
    inAppContent: string;
    resources: CuratedResourceItem[];
  };
  practice: {
    title: string;
    description: string;
    durationMinutes: number;
    exercises: string[];
    starterCode?: string;
  };
  assessment: {
    title: string;
    description: string;
    durationMinutes: number;
    passingScorePercentage: number;
    questions: {
      id: string;
      prompt: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
      explanation: string;
    }[];
  };
}

export interface WeekCurriculum {
  weekNumber: number;
  weekTitle: string;
  overview: string;
  days: DayCurriculum[];
}

export const SOFTWARE_ENGINEER_CURRICULUM: WeekCurriculum[] = [
  {
    weekNumber: 1,
    weekTitle: "Algorithmic Complexity & Core Data Structures",
    overview:
      "Establish computer science foundations: Big-O asymptotic notation, memory layouts, and contiguous array manipulation in Java/Python.",
    days: [
      {
        dayNumber: 1,
        dayTitle: "Asymptotic Analysis & Big-O Notation",
        topics: ["Time Complexity", "Space Complexity", "Worst/Average/Best Case", "Big-O Constants"],
        learning: {
          title: "Understanding Time and Space Complexity with Big-O",
          description:
            "Learn how computational efficiency is measured independent of machine hardware and compiler variations.",
          durationMinutes: 35,
          inAppContent: `### Asymptotic Complexity Foundations
When we analyze algorithms, evaluating runtime in clock seconds is unreliable because execution speed varies across processors, CPU architectures, and operating system load.

Instead, computer scientists measure the **rate of growth** of operations relative to input size $N$:

1. **$O(1)$ Constant Time:** Execution time is independent of input size. Example: Accessing an array element by index \`arr[4]\`.
2. **$O(\\log N)$ Logarithmic Time:** The problem space halves in each step. Example: Binary search in a sorted array.
3. **$O(N)$ Linear Time:** Execution scales directly proportional to input size. Example: A single loop iterating over all elements.
4. **$O(N \\log N)$ Linearithmic Time:** Optimal comparison-based sorting algorithms like Merge Sort and Quick Sort.
5. **$O(N^2)$ Quadratic Time:** Nested loops over the input space. Example: Bubble Sort or naive brute-force pair comparisons.

#### Rule of Thumb for Interview Constraints
- If $N \\le 10^4$: An $O(N^2)$ algorithm may pass within 1-2 seconds.
- If $N \\le 10^6$: Aim for $O(N)$ or $O(N \\log N)$.
- If $N \\le 10^9$: Only $O(\\log N)$ or $O(1)$ will execute without timing out.`,
          resources: [
            {
              title: "MIT 6.006 Lecture 1: Algorithmic Thinking & Peak Finding",
              url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-1-algorithmic-thinking-peak-finding/",
              resourceType: "VIDEO",
              isVerified: true,
            },
            {
              title: "Big-O Cheat Sheet: Time & Space Complexity Charts",
              url: "https://www.bigocheatsheet.com/",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "GeeksforGeeks: Analysis of Algorithms",
              url: "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "Big-O Complexity Identification Practice",
          description: "Analyze code snippets and deduce exact worst-case and best-case time complexities.",
          durationMinutes: 35,
          exercises: [
            "Calculate the time complexity of finding duplicate numbers in an unsorted array using a nested loop vs. a HashSet.",
            "Analyze the recurrence relation of binary search: $T(N) = T(N/2) + O(1)$.",
            "Trace the space complexity of recursive calls on the runtime call stack.",
          ],
          starterCode: `// Exercise: What is the Big-O time and space complexity of this function?
public static int mysteryFunction(int[] arr) {
    int total = 0;
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            total += arr[i] * arr[j];
        }
    }
    return total;
}`,
        },
        assessment: {
          title: "Day 1 Assessment: Big-O & Complexity Mastery",
          description: "Test your ability to derive computational complexities and memory footprints.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "se_d1_q1",
              prompt: "What is the worst-case time complexity of accessing an element in an array by index in Java or C++?",
              options: [
                { id: "a", text: "O(1) - Constant time due to contiguous memory index arithmetic" },
                { id: "b", text: "O(N) - Linear time because it must scan the elements sequentially" },
                { id: "c", text: "O(log N) - Logarithmic search" },
                { id: "d", text: "O(N log N)" },
              ],
              correctOptionId: "a",
              explanation: "Arrays occupy a contiguous block of memory. The memory address is calculated instantly using: base_address + index * element_size, which takes O(1) time.",
            },
            {
              id: "se_d1_q2",
              prompt: "What is the time complexity of binary search on a sorted array of size N?",
              options: [
                { id: "a", text: "O(N)" },
                { id: "b", text: "O(log N)" },
                { id: "c", text: "O(N log N)" },
                { id: "d", text: "O(1)" },
              ],
              correctOptionId: "b",
              explanation: "Binary search eliminates half of the remaining search space with each comparison, running in O(log N) steps.",
            },
            {
              id: "se_d1_q3",
              prompt: "If an algorithm runs a loop from 1 to N, and inside runs another loop from 1 to 100 (a fixed constant), what is its overall Big-O time complexity?",
              options: [
                { id: "a", text: "O(N^2)" },
                { id: "b", text: "O(100N) which simplifies to O(N)" },
                { id: "c", text: "O(N log N)" },
                { id: "d", text: "O(1)" },
              ],
              correctOptionId: "b",
              explanation: "Constant multipliers are dropped in asymptotic Big-O notation. 100 * N operations is strictly O(N).",
            },
            {
              id: "se_d1_q4",
              prompt: "What space complexity is consumed by a recursive function that makes N recursive calls before returning?",
              options: [
                { id: "a", text: "O(1) auxiliary space" },
                { id: "b", text: "O(N) space due to call stack frames" },
                { id: "c", text: "O(N^2) space" },
                { id: "d", text: "Zero space in all languages" },
              ],
              correctOptionId: "b",
              explanation: "Each recursive invocation pushes a stack frame with local variables and return pointers onto the call stack. N recursive depths consume O(N) memory.",
            },
            {
              id: "se_d1_q5",
              prompt: "Which complexity class grows slowest as N approaches infinity?",
              options: [
                { id: "a", text: "O(N)" },
                { id: "b", text: "O(log N)" },
                { id: "c", text: "O(N^0.5)" },
                { id: "d", text: "O(N log N)" },
              ],
              correctOptionId: "b",
              explanation: "Logarithmic growth O(log N) grows far slower than linear, square root, or linearithmic curves.",
            },
          ],
        },
      },
      {
        dayNumber: 2,
        dayTitle: "Array Transformations & Two-Pointer Technique",
        topics: ["In-Place Mutation", "Two Pointers", "Sliding Window Introduction"],
        learning: {
          title: "Mastering Array Operations and the Two-Pointer Pattern",
          description:
            "Learn how two pointers moving from opposite ends or at different speeds optimize time from O(N^2) to O(N).",
          durationMinutes: 35,
          inAppContent: `### The Two-Pointer Pattern
Many array problems (e.g., reversing an array, Two Sum in a sorted array, removing duplicates) can be naively solved using nested loops in $O(N^2)$ time.

The **Two-Pointer technique** allows you to solve these in $O(N)$ time with $O(1)$ extra space by leveraging sorted properties or directional pointers:

\`\`\`java
// Classic Two Sum on a Sorted Array (Opposite Direction Pointers)
public int[] twoSumSorted(int[] numbers, int target) {
    int left = 0;
    int right = numbers.length - 1;
    
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++; // Need a larger sum
        } else {
            right--; // Need a smaller sum
        }
    }
    return new int[]{-1, -1};
}
\`\`\`

#### Key Takeaways:
- **Zero Extra Memory:** Avoid creating supplementary lists or HashMaps when the data is already sorted.
- **Fast-Slow Pointer:** Useful for cycle detection and in-place duplicate removal.`,
          resources: [
            {
              title: "Oracle Java Documentation: Arrays Class Guide",
              url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "LeetCode Explore: Two-Pointer Technique",
              url: "https://leetcode.com/explore/learn/card/array-and-string/205/array-two-pointer-technique/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "In-Place Array Practice",
          description: "Implement two-pointer algorithms for reversing strings and finding pairs.",
          durationMinutes: 35,
          exercises: [
            "Reverse a character array in-place with O(1) extra memory.",
            "Remove duplicates from a sorted array in-place and return the new length.",
            "Move all zeros to the end of an array while maintaining relative order of non-zero elements.",
          ],
        },
        assessment: {
          title: "Day 2 Assessment: Two-Pointer Mastery",
          description: "Validate your comprehension of two-pointer efficiency and edge cases.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "se_d2_q1",
              prompt: "Why does the two-pointer approach for Two Sum require the array to be sorted first?",
              options: [
                { id: "a", text: "Because only sorted arrays allow index access in Java" },
                { id: "b", text: "Because moving the left/right pointers provides a deterministic signal whether the current sum is too small or too large" },
                { id: "c", text: "It does not require sorting; it works on random arrays" },
                { id: "d", text: "To avoid integer overflow" },
              ],
              correctOptionId: "b",
              explanation: "If the array is sorted, sum < target guarantees that moving the left pointer right increases the sum, and moving the right pointer left decreases it.",
            },
            {
              id: "se_d2_q2",
              prompt: "What is the time complexity of reversing an array of size N in-place using two pointers?",
              options: [
                { id: "a", text: "O(1)" },
                { id: "b", text: "O(N/2) which is O(N)" },
                { id: "c", text: "O(N^2)" },
                { id: "d", text: "O(log N)" },
              ],
              correctOptionId: "b",
              explanation: "The pointers meet in the middle after N/2 swaps. Dropping constants yields O(N) linear time.",
            },
            {
              id: "se_d2_q3",
              prompt: "When removing duplicates from a sorted array in-place, which pointer strategy is ideal?",
              options: [
                { id: "a", text: "Opposite directional pointers from both ends" },
                { id: "b", text: "Slow and fast pointers both starting from the front" },
                { id: "c", text: "Three pointers moving in circles" },
                { id: "d", text: "Randomized pointers" },
              ],
              correctOptionId: "b",
              explanation: "The fast pointer scans every element, while the slow pointer tracks the position of the latest unique element.",
            },
            {
              id: "se_d2_q4",
              prompt: "What is the auxiliary space complexity of an in-place two-pointer algorithm?",
              options: [
                { id: "a", text: "O(1) - Constant additional memory" },
                { id: "b", text: "O(N) - Linear additional memory" },
                { id: "c", text: "O(N log N)" },
                { id: "d", text: "O(N^2)" },
              ],
              correctOptionId: "a",
              explanation: "In-place modifications mutate the existing array directly using only two scalar index variables, consuming O(1) space.",
            },
            {
              id: "se_d2_q5",
              prompt: "What happens if a two-pointer loop condition is `while (left <= right)` when checking palindromes, and an odd-length string is evaluated?",
              options: [
                { id: "a", text: "An ArrayIndexOutOfBoundsException occurs" },
                { id: "b", text: "The middle character is safely compared with itself at left == right without causing an error" },
                { id: "c", text: "Infinite loop" },
                { id: "d", text: "The first character is skipped" },
              ],
              correctOptionId: "b",
              explanation: "When left == right on an odd-length string, both pointers point to the central character, which equals itself. However, `left < right` is cleaner to skip the redundant middle check.",
            },
          ],
        },
      },
    ],
  },
];

export const WEB_DEVELOPER_CURRICULUM: WeekCurriculum[] = [
  {
    weekNumber: 1,
    weekTitle: "Semantic HTML5, Accessibility & Modern CSS Box Model",
    overview:
      "Master the semantic web, accessibility compliance (WCAG 2.2), and modern CSS box models and layout fundamentals.",
    days: [
      {
        dayNumber: 1,
        dayTitle: "Semantic HTML5 & Accessibility (a11y)",
        topics: ["Semantic Landmarks", "ARIA Roles", "Keyboard Navigation", "WCAG Essentials"],
        learning: {
          title: "Building Accessible and Semantic Web Interfaces",
          description:
            "Understand why semantic markup matters for SEO, screen readers, and maintainable web applications.",
          durationMinutes: 35,
          inAppContent: `### Why Semantic HTML Matters
Using \`<div>\` and \`<span>\` for every UI element deprives web browsers, search engines, and screen readers of structural meaning.

Semantic tags provide native behavior and accessibility:
- \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<footer>\`: Built-in ARIA landmarks that screen reader users use to jump across page sections.
- \`<button>\`: Natively handles keyboard focus (Tab key) and activation (Enter and Space keys). A \`<div onClick={...}>\` does NOT have native keyboard focus without manually managing \`tabIndex\` and \`onKeyDown\`.
- \`<form>\` & \`<label>\`: Associates inputs with descriptive text for assistive technology and enables native submission behavior.

\`\`\`html
<!-- Semantic & Accessible -->
<nav aria-label="Main Navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/learn">Learning</a></li>
  </ul>
</nav>

<main id="main-content">
  <h1>Your Career Roadmap</h1>
  <button type="button" onClick="handleStart()">Continue Task</button>
</main>
\`\`\``,
          resources: [
            {
              title: "MDN Web Docs: HTML Elements Reference",
              url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "W3C Web Content Accessibility Guidelines (WCAG) 2.2 Overview",
              url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
              resourceType: "SPECIFICATION",
              isVerified: true,
            },
            {
              title: "web.dev: Learn Accessibility",
              url: "https://web.dev/learn/accessibility/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "Refactoring to Semantic Markup",
          description: "Audit non-semantic code and convert generic divs into accessible semantic landmarks.",
          durationMinutes: 35,
          exercises: [
            "Audit a webpage snippet and replace div soup with semantic HTML5 elements.",
            "Add appropriate aria-label and aria-expanded attributes to a collapsible navigation menu.",
            "Verify keyboard focus order using Tab and Shift+Tab navigation.",
          ],
        },
        assessment: {
          title: "Day 1 Assessment: HTML5 & Accessibility",
          description: "Validate semantic HTML knowledge and accessibility best practices.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "web_d1_q1",
              prompt: "Why should developers use `<button>` instead of `<div onClick=...>` for interactive buttons?",
              options: [
                { id: "a", text: "`<button>` elements are natively focusable via Tab, announce themselves to screen readers, and activate on Enter/Space keys" },
                { id: "b", text: "`<div>` cannot have CSS styling applied to it" },
                { id: "c", text: "`<button>` renders faster in JavaScript engines" },
                { id: "d", text: "`<div>` is deprecated in HTML5" },
              ],
              correctOptionId: "a",
              explanation: "Native `<button>` elements include built-in keyboard accessibility, ARIA role declaration, and native event handlers for keyboard triggers without extra JavaScript.",
            },
            {
              id: "web_d1_q2",
              prompt: "Which HTML5 element represents the dominant content of the `<body>` that is directly related to or expands upon the central topic of the page?",
              options: [
                { id: "a", text: "<content>" },
                { id: "b", text: "<main>" },
                { id: "c", text: "<section>" },
                { id: "d", text: "<primary>" },
              ],
              correctOptionId: "b",
              explanation: "The `<main>` element represents the dominant content of the document. A document must not have more than one non-hidden `<main>` element.",
            },
            {
              id: "web_d1_q3",
              prompt: "What is the primary purpose of the `alt` attribute on an `<img>` tag?",
              options: [
                { id: "a", text: "To specify the visual border width of the image" },
                { id: "b", text: "To provide alternative textual description for visually impaired users using screen readers and when the image fails to load" },
                { id: "c", text: "To trigger lazy loading" },
                { id: "d", text: "To preload the image in the browser cache" },
              ],
              correctOptionId: "b",
              explanation: "The alt attribute provides alternative text for screen readers and acts as a placeholder if the image fails to load.",
            },
            {
              id: "web_d1_q4",
              prompt: "How does a screen reader user benefit from proper `<h1>` through `<h6>` heading hierarchy?",
              options: [
                { id: "a", text: "Screen reader users can navigate and jump directly between document sections using heading shortcut keys" },
                { id: "b", text: "Headings force the browser to change font size automatically" },
                { id: "c", text: "Headings encrypt text for privacy" },
                { id: "d", text: "It prevents CSS from overriding fonts" },
              ],
              correctOptionId: "a",
              explanation: "Screen reader users commonly navigate web pages by jumping between headings (e.g., using the 'H' key in NVDA or VoiceOver) to quickly scan structure.",
            },
            {
              id: "web_d1_q5",
              prompt: "What is the recommended contrast ratio under WCAG 2.1 Level AA for normal body text against its background?",
              options: [
                { id: "a", text: "At least 4.5:1" },
                { id: "b", text: "At least 1.5:1" },
                { id: "c", text: "Exactly 10:1" },
                { id: "d", text: "Contrast ratio is not regulated" },
              ],
              correctOptionId: "a",
              explanation: "WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).",
            },
          ],
        },
      },
      {
        dayNumber: 2,
        dayTitle: "Modern CSS Box Model & Flexbox Layouts",
        topics: ["Box Sizing", "Flexbox Axis", "Alignment", "Responsive Wrapping"],
        learning: {
          title: "Mastering CSS Box Model & Flexbox Layout Systems",
          description:
            "Understand how browsers calculate element geometry and build responsive layouts using CSS Flexbox.",
          durationMinutes: 35,
          inAppContent: `### The CSS Box Model & Flexbox
Every element on a web page is rendered as a rectangular box comprising:
1. **Content**: The inner text or nested child nodes.
2. **Padding**: Transparent spacing around the content inside the border.
3. **Border**: The frame bounding the padding.
4. **Margin**: Transparent spacing outside the border separating neighboring elements.

Always declare \`box-sizing: border-box\` across all elements:
\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

### Flexbox Essentials
Flexbox operates on a one-dimensional layout model along two axes:
- **Main Axis**: Defined by \`flex-direction\` (\`row\` or \`column\`).
- **Cross Axis**: Perpendicular to the main axis.

\`\`\`css
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between; /* Alignment along main axis */
  align-items: center;            /* Alignment along cross axis */
  gap: 1.5rem;                   /* Modern gutter spacing */
  flex-wrap: wrap;                /* Drops items to next line on mobile */
}
\`\`\``,
          resources: [
            {
              title: "MDN Web Docs: CSS Flexible Box Layout",
              url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "CSS-Tricks: A Complete Guide to Flexbox",
              url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "Flexbox Navigation & Card Grid",
          description: "Build a responsive navigation header and a 3-column card grid using Flexbox.",
          durationMinutes: 35,
          exercises: [
            "Build a responsive header with logo on left and nav links on right using `justify-content: space-between`.",
            "Center an element perfectly both horizontally and vertically using Flexbox in 3 lines of CSS.",
            "Implement a responsive card group that wraps cleanly on mobile viewports.",
          ],
        },
        assessment: {
          title: "Day 2 Assessment: Box Model & Flexbox",
          description: "Test your understanding of CSS layout geometry and flex positioning.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "web_d2_q1",
              prompt: "What does `justify-content: space-between` do inside a flex container?",
              options: [
                { id: "a", text: "Distributes flex items evenly along the main axis, with the first item flush against the start and last item flush against the end" },
                { id: "b", text: "Centers all items in the exact middle of the screen" },
                { id: "c", text: "Stretches items vertically to fill the cross axis" },
                { id: "d", text: "Adds 20px padding between items" },
              ],
              correctOptionId: "a",
              explanation: "`space-between` places items evenly along the main axis with no outer margins on the start and end items.",
            },
            {
              id: "web_d2_q2",
              prompt: "If `flex-direction: column` is set on a container, which property controls horizontal alignment of child items?",
              options: [
                { id: "a", text: "align-items (because the cross axis is now horizontal)" },
                { id: "b", text: "justify-content" },
                { id: "c", text: "text-align" },
                { id: "d", text: "float" },
              ],
              correctOptionId: "a",
              explanation: "When `flex-direction: column` is set, the main axis runs vertically (top-to-bottom) and the cross axis runs horizontally (left-to-right). Thus `align-items` controls horizontal alignment.",
            },
            {
              id: "web_d2_q3",
              prompt: "What is the benefit of the CSS `gap` property in Flexbox?",
              options: [
                { id: "a", text: "It creates uniform spacing between flex items without needing hacky child margins like `:last-child { margin-right: 0 }`" },
                { id: "b", text: "It adds borders around cards" },
                { id: "c", text: "It increases browser cache sizes" },
                { id: "d", text: "It automatically scales font sizes" },
              ],
              correctOptionId: "a",
              explanation: "The `gap` property sets clean gutters between flex items without applying awkward outer margins to the first or last items.",
            },
            {
              id: "web_d2_q4",
              prompt: "What is the default value of `flex-shrink` for flex items?",
              options: [
                { id: "a", text: "1 (items shrink by default if space is constrained)" },
                { id: "b", text: "0 (items never shrink)" },
                { id: "c", text: "100" },
                { id: "d", text: "auto" },
              ],
              correctOptionId: "a",
              explanation: "The default value of `flex-shrink` is 1, meaning flex items will shrink proportionally to avoid overflowing the flex container.",
            },
            {
              id: "web_d2_q5",
              prompt: "How can you center an item both vertically and horizontally inside a container using Flexbox?",
              options: [
                { id: "a", text: "display: flex; justify-content: center; align-items: center;" },
                { id: "b", text: "display: block; margin: auto;" },
                { id: "c", text: "position: relative; float: center;" },
                { id: "d", text: "align-content: middle;" },
              ],
              correctOptionId: "a",
              explanation: "Applying `display: flex; justify-content: center; align-items: center;` centers children along both the main and cross axes.",
            },
          ],
        },
      },
    ],
  },
];

export const DATA_ANALYST_CURRICULUM: WeekCurriculum[] = [
  {
    weekNumber: 1,
    weekTitle: "Relational Foundations & Advanced SQL Querying",
    overview:
      "Master relational database concepts, entity-relationship models, filtering, aggregations, and multi-table SQL joins.",
    days: [
      {
        dayNumber: 1,
        dayTitle: "Relational Modeling & SQL Filtering",
        topics: ["Relational Schema", "SELECT & WHERE", "NULL Semantics", "Sorting with ORDER BY"],
        learning: {
          title: "Introduction to Relational Databases and SQL Foundations",
          description:
            "Learn how relational databases store data in structured tables and how to retrieve records using SQL.",
          durationMinutes: 35,
          inAppContent: `### Relational Databases & SQL
In relational database management systems (RDBMS) like PostgreSQL, data is structured into normalized tables with rows (records) and columns (attributes).

#### SQL Query Execution Order
Writing SQL differs from imperative languages like Python because SQL is declarative. The database engine executes clauses in this logical sequence:
1. **FROM / JOIN**: Determines the source tables and Cartesian products.
2. **WHERE**: Filters individual rows *before* any grouping occurs.
3. **GROUP BY**: Groups rows with matching values.
4. **HAVING**: Filters grouped data *after* aggregation.
5. **SELECT**: Evaluates column expressions and aliases.
6. **DISTINCT**: De-duplicates rows.
7. **ORDER BY**: Sorts the final result set.
8. **LIMIT / OFFSET**: Constrains the number of returned rows.

\`\`\`sql
-- Example: Retrieve active students enrolled in Computer Science
SELECT 
  user_id,
  full_name,
  semester
FROM users
WHERE course = 'B.Tech' 
  AND branch = 'CSE'
  AND account_status = 'ACTIVE'
ORDER BY semester DESC, full_name ASC
LIMIT 50;
\`\`\`

#### NULL Value Traps
In SQL, \`NULL\` represents unknown or missing data. You cannot compare \`NULL = NULL\` or \`col != NULL\`. Always use \`IS NULL\` or \`IS NOT NULL\`.`,
          resources: [
            {
              title: "PostgreSQL Official Documentation: The SQL Language",
              url: "https://www.postgresql.org/docs/current/tutorial-sql.html",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "Mode Analytics: SQL Tutorial for Data Analysis",
              url: "https://mode.com/sql-tutorial/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "Writing Structured SQL Filters",
          description: "Practice filtering, sorting, and handling NULL values on sample student datasets.",
          durationMinutes: 35,
          exercises: [
            "Write a query to find all orders placed in Q3 where total amount exceeds $500 and status is 'COMPLETED'.",
            "Identify customer accounts that have never registered an email verification record using `IS NULL`.",
            "Sort products by category ascending and price descending with a limit of 10 items.",
          ],
        },
        assessment: {
          title: "Day 1 Assessment: SQL Query Foundations",
          description: "Test relational database concepts, NULL handling, and execution order.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "da_d1_q1",
              prompt: "In what logical order does a SQL database engine evaluate `WHERE`, `FROM`, and `SELECT` clauses?",
              options: [
                { id: "a", text: "FROM -> WHERE -> SELECT" },
                { id: "b", text: "SELECT -> FROM -> WHERE" },
                { id: "c", text: "WHERE -> FROM -> SELECT" },
                { id: "d", text: "Simultaneously in parallel" },
              ],
              correctOptionId: "a",
              explanation: "The engine first resolves the table source in FROM, then filters candidate rows in WHERE, and finally computes the requested columns in SELECT.",
            },
            {
              id: "da_d1_q2",
              prompt: "How should you correctly test if a column contains a missing/null value in SQL?",
              options: [
                { id: "a", text: "WHERE column_name IS NULL" },
                { id: "b", text: "WHERE column_name = NULL" },
                { id: "c", text: "WHERE column_name == 'null'" },
                { id: "d", text: "WHERE column_name = 0" },
              ],
              correctOptionId: "a",
              explanation: "In three-valued SQL logic, `col = NULL` evaluates to UNKNOWN (neither true nor false). The dedicated predicate `IS NULL` is required.",
            },
            {
              id: "da_d1_q3",
              prompt: "What does the SQL `DISTINCT` keyword accomplish?",
              options: [
                { id: "a", text: "Eliminates duplicate rows from the final result set" },
                { id: "b", text: "Sorts the data alphabetically" },
                { id: "c", text: "Counts the number of records" },
                { id: "d", text: "Creates a new primary key" },
              ],
              correctOptionId: "a",
              explanation: "`DISTINCT` removes duplicate rows from the output so that every returned record is unique across the selected columns.",
            },
            {
              id: "da_d1_q4",
              prompt: "Can a column alias defined in the `SELECT` clause (e.g. `SELECT price * quantity AS total_cost`) be referenced directly inside the `WHERE` clause in standard SQL?",
              options: [
                { id: "a", text: "No, because the WHERE clause is evaluated before the SELECT clause defines the alias" },
                { id: "b", text: "Yes, standard SQL allows aliases everywhere" },
                { id: "c", text: "Only if the alias begins with an underscore" },
                { id: "d", text: "Yes, but only in PostgreSQL" },
              ],
              correctOptionId: "a",
              explanation: "Because `WHERE` filters rows before `SELECT` executes, the alias does not exist yet when `WHERE` is processed.",
            },
            {
              id: "da_d1_q5",
              prompt: "Which clause allows you to sort results in descending numerical or alphabetical order?",
              options: [
                { id: "a", text: "ORDER BY column_name DESC" },
                { id: "b", text: "SORT BY column_name DOWN" },
                { id: "c", text: "GROUP BY column_name REVERSE" },
                { id: "d", text: "FILTER column_name DESC" },
              ],
              correctOptionId: "a",
              explanation: "`ORDER BY column_name DESC` orders records in descending order (highest to lowest or Z to A).",
            },
          ],
        },
      },
      {
        dayNumber: 2,
        dayTitle: "Multi-Table SQL Joins & Relational Integrity",
        topics: ["INNER JOIN", "LEFT JOIN", "RIGHT & FULL OUTER JOIN", "Foreign Key Relationships"],
        learning: {
          title: "Connecting Data with Multi-Table SQL Joins",
          description:
            "Understand how primary and foreign keys establish relationships and combine data from multiple tables.",
          durationMinutes: 35,
          inAppContent: `### Relational Joins Explained
A major advantage of relational databases is data normalization: avoiding redundant data by linking tables via **Foreign Keys**.

\`\`\`sql
-- Customers Table: id (PK), name, email
-- Orders Table: id (PK), customer_id (FK), total_amount, order_date

-- 1. INNER JOIN: Returns only customers who have placed at least one order
SELECT c.name, o.id AS order_id, o.total_amount
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;

-- 2. LEFT JOIN: Returns ALL customers, matching orders if present, or NULL if no orders
SELECT c.name, COUNT(o.id) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
\`\`\`

#### Join Types Overview:
- **INNER JOIN**: Intersection of both tables.
- **LEFT JOIN**: All rows from left table + matched rows from right.
- **RIGHT JOIN**: All rows from right table + matched rows from left.
- **FULL OUTER JOIN**: Union of all records from both tables.`,
          resources: [
            {
              title: "PostgreSQL Documentation: Table Joins",
              url: "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-FROM",
              resourceType: "DOCUMENTATION",
              isVerified: true,
            },
            {
              title: "Visual SQL Joins Guide",
              url: "https://joins.spathon.com/",
              resourceType: "TUTORIAL",
              isVerified: true,
            },
          ],
        },
        practice: {
          title: "Multi-Table Join Exercises",
          description: "Write queries combining users, assessment attempts, and questions.",
          durationMinutes: 35,
          exercises: [
            "Write a LEFT JOIN between users and assessment attempts to find registered students who have never attempted an assessment.",
            "Join questions and submission answers to calculate the percentage of correct attempts per question.",
            "Write a self-join to find employees who earn more than their direct manager.",
          ],
        },
        assessment: {
          title: "Day 2 Assessment: SQL Joins Mastery",
          description: "Validate your mastery of relational joins and cardinality.",
          durationMinutes: 20,
          passingScorePercentage: 60,
          questions: [
            {
              id: "da_d2_q1",
              prompt: "What will an INNER JOIN between Table A (10 rows) and Table B (5 rows) return if NO foreign keys match?",
              options: [
                { id: "a", text: "0 rows" },
                { id: "b", text: "5 rows" },
                { id: "c", text: "10 rows" },
                { id: "d", text: "15 rows" },
              ],
              correctOptionId: "a",
              explanation: "An INNER JOIN requires the join condition (e.g. `A.id = B.a_id`) to evaluate to true. If no rows match, 0 rows are returned.",
            },
            {
              id: "da_d2_q2",
              prompt: "How can you identify rows in Table A that have NO corresponding match in Table B using a LEFT JOIN?",
              options: [
                { id: "a", text: "FROM TableA a LEFT JOIN TableB b ON a.id = b.a_id WHERE b.id IS NULL" },
                { id: "b", text: "FROM TableA a LEFT JOIN TableB b ON a.id = b.a_id WHERE b.id = 0" },
                { id: "c", text: "WHERE TableA.id != TableB.id" },
                { id: "d", text: "A LEFT JOIN cannot identify unmatched rows" },
              ],
              correctOptionId: "a",
              explanation: "A LEFT JOIN populates NULL for all Table B columns when no match exists. Filtering with `WHERE b.id IS NULL` isolates unmatched rows.",
            },
            {
              id: "da_d2_q3",
              prompt: "What is a CROSS JOIN in SQL?",
              options: [
                { id: "a", text: "A Cartesian product combining every row of Table A with every row of Table B (size = A * B)" },
                { id: "b", text: "A join that deletes matching rows" },
                { id: "c", text: "A join between tables in different databases" },
                { id: "d", text: "An error in standard SQL" },
              ],
              correctOptionId: "a",
              explanation: "A CROSS JOIN produces the Cartesian product of the two tables, matching every row of the first table with every row of the second table.",
            },
            {
              id: "da_d2_q4",
              prompt: "What SQL function can be used to replace NULL values with a default value (e.g. 0) in join aggregations?",
              options: [
                { id: "a", text: "COALESCE(column_name, 0)" },
                { id: "b", text: "ISNULL(column_name, 0) in PostgreSQL" },
                { id: "c", text: "REPLACE_NULL(column_name)" },
                { id: "d", text: "DEFAULT(column_name, 0)" },
              ],
              correctOptionId: "a",
              explanation: "`COALESCE(expr1, expr2, ...)` is standard SQL and returns the first non-null expression in its argument list.",
            },
            {
              id: "da_d2_q5",
              prompt: "If Table A has 10 rows and Table B has 10 rows, and every row in A matches exactly 2 rows in B, how many rows does an INNER JOIN yield?",
              options: [
                { id: "a", text: "20 rows" },
                { id: "b", text: "10 rows" },
                { id: "c", text: "5 rows" },
                { id: "d", text: "100 rows" },
              ],
              correctOptionId: "a",
              explanation: "Each of the 10 rows in A matches 2 rows in B, generating 10 * 2 = 20 joined rows.",
            },
          ],
        },
      },
    ],
  },
];

export function getCurriculumForTrack(track: CareerTrackType): WeekCurriculum[] {
  switch (track) {
    case "SOFTWARE_ENGINEER":
      return SOFTWARE_ENGINEER_CURRICULUM;
    case "WEB_DEVELOPER":
      return WEB_DEVELOPER_CURRICULUM;
    case "DATA_ANALYST":
      return DATA_ANALYST_CURRICULUM;
  }
}

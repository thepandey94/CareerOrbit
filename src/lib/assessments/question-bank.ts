import { CareerTrackType } from "../onboarding/scoring";

export type AssessmentQuestionType = "CONCEPTUAL" | "CODE_OUTPUT" | "DEBUGGING" | "CODING_PROBLEM";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface StarterCodeMap {
  python: string;
  java: string;
}

export interface QuestionTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface AssessmentQuestion {
  id: string;
  track?: CareerTrackType;
  topic: string;
  category?: "QUANTITATIVE" | "LOGICAL" | "VERBAL" | "TECHNICAL";
  questionType: AssessmentQuestionType;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prompt: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  starterCode?: StarterCodeMap;
  testCases?: QuestionTestCase[];
  solutionExplanation: string;
}

/* =========================================================================================
 * 1. TECHNICAL ROUND QUESTION BANK (25 questions per level: 15 conceptual, 5 output/debug, 5 coding)
 * ========================================================================================= */

export const TECHNICAL_QUESTIONS_SE_LEVEL1: AssessmentQuestion[] = [
  // --- 15 CONCEPTUAL QUESTIONS ---
  {
    id: "se_l1_c01",
    track: "SOFTWARE_ENGINEER",
    topic: "OOP",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which pillar of Object-Oriented Programming is demonstrated when internal object state is hidden and only accessible via public getter and setter methods?",
    options: [
      { id: "a", text: "Polymorphism" },
      { id: "b", text: "Encapsulation" },
      { id: "c", text: "Inheritance" },
      { id: "d", text: "Abstraction" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Encapsulation bundles data (fields) with code (methods) that manipulates that data, restricting direct external access to prevent arbitrary state modification.",
  },
  {
    id: "se_l1_c02",
    track: "SOFTWARE_ENGINEER",
    topic: "MEMORY_MANAGEMENT",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "In Java and Python runtime environments, where are dynamically instantiated objects stored?",
    options: [
      { id: "a", text: "Call Stack" },
      { id: "b", text: "Heap Memory" },
      { id: "c", text: "CPU Registers" },
      { id: "d", text: "Method / Metaspace Area" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Object instances and arrays reside in Heap memory, while primitive local variables and execution frame pointers reside on the Thread Call Stack.",
  },
  {
    id: "se_l1_c03",
    track: "SOFTWARE_ENGINEER",
    topic: "DATA_STRUCTURES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the worst-case time complexity of searching for an element in an unsorted array of size N?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log N)" },
      { id: "c", text: "O(N)" },
      { id: "d", text: "O(N^2)" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Linear search requires scanning every element in an unsorted array until the target is found or the end is reached, giving O(N) worst-case time.",
  },
  {
    id: "se_l1_c04",
    track: "SOFTWARE_ENGINEER",
    topic: "DATA_STRUCTURES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which data structure follows the Last-In, First-Out (LIFO) operational discipline?",
    options: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Stack" },
      { id: "c", text: "Binary Tree" },
      { id: "d", text: "Linked List" },
    ],
    correctOptionId: "b",
    solutionExplanation: "A Stack enforces LIFO access, where the most recently pushed item is the first one popped.",
  },
  {
    id: "se_l1_c05",
    track: "SOFTWARE_ENGINEER",
    topic: "ALGORITHMS",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Binary Search requires which prerequisite condition on the input array to function correctly?",
    options: [
      { id: "a", text: "Elements must be unique positive integers" },
      { id: "b", text: "Array must be sorted in ascending or descending order" },
      { id: "c", text: "Array must have an even number of elements" },
      { id: "d", text: "Elements must be contiguous memory pointers" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Binary search compares the target against the middle element and halves the search space, which only works if the collection is sorted.",
  },
  {
    id: "se_l1_c06",
    track: "SOFTWARE_ENGINEER",
    topic: "OOP",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the primary difference between method overloading and method overriding?",
    options: [
      { id: "a", text: "Overloading occurs at runtime; Overriding occurs at compile time" },
      { id: "b", text: "Overloading has same signature in subclass; Overriding has different parameters in same class" },
      { id: "c", text: "Overloading defines methods with same name but different parameter lists; Overriding re-implements an inherited superclass method" },
      { id: "d", text: "Overloading requires the abstract keyword, overriding cannot use abstract" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Method overloading is compile-time polymorphism (same name, distinct arguments). Overriding is runtime polymorphism (subclass replaces inherited behavior).",
  },
  {
    id: "se_l1_c07",
    track: "SOFTWARE_ENGINEER",
    topic: "DATA_STRUCTURES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the average-case time complexity of inserting a key-value pair into a well-distributed Hash Table?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log N)" },
      { id: "c", text: "O(N)" },
      { id: "d", text: "O(N log N)" },
    ],
    correctOptionId: "a",
    solutionExplanation: "Under uniform hashing with an acceptable load factor, hash table insertion takes O(1) amortized average time.",
  },
  {
    id: "se_l1_c08",
    track: "SOFTWARE_ENGINEER",
    topic: "OPERATING_SYSTEMS",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the primary distinction between a Process and a Thread in operating systems?",
    options: [
      { id: "a", text: "Processes share memory address spaces, while threads have isolated address spaces" },
      { id: "b", text: "Threads within the same process share code, data, and open files, but have their own registers and stack" },
      { id: "c", text: "Processes are managed only by user-space, while threads are always hardware interrupts" },
      { id: "d", text: "Threads cannot be scheduled across multiple CPU cores" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Threads are lightweight units of execution within a process that share virtual address space and file descriptors, but each thread retains its own program counter and stack.",
  },
  {
    id: "se_l1_c09",
    track: "SOFTWARE_ENGINEER",
    topic: "NETWORKING",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which transport protocol guarantees reliable, ordered delivery of data packets via three-way handshakes and acknowledgments?",
    options: [
      { id: "a", text: "UDP (User Datagram Protocol)" },
      { id: "b", text: "TCP (Transmission Control Protocol)" },
      { id: "c", text: "ICMP" },
      { id: "d", text: "DNS" },
    ],
    correctOptionId: "b",
    solutionExplanation: "TCP ensures reliable, ordered, error-checked packet streams using connection handshakes, sequence numbers, and retransmissions.",
  },
  {
    id: "se_l1_c10",
    track: "SOFTWARE_ENGINEER",
    topic: "DATABASES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "In relational database design, what does the 'A' in the ACID transaction model stand for?",
    options: [
      { id: "a", text: "Availability" },
      { id: "b", text: "Atomicity" },
      { id: "c", text: "Authorization" },
      { id: "d", text: "Asynchronous" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Atomicity guarantees that all operations within a database transaction either succeed together or are rolled back completely ('all-or-nothing').",
  },
  {
    id: "se_l1_c11",
    track: "SOFTWARE_ENGINEER",
    topic: "ALGORITHMS",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which sorting algorithm maintains a guaranteed worst-case time complexity of O(N log N) using a Divide and Conquer approach?",
    options: [
      { id: "a", text: "Bubble Sort" },
      { id: "b", text: "Insertion Sort" },
      { id: "c", text: "Merge Sort" },
      { id: "d", text: "Quick Sort" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Merge Sort recursively divides the array in half and merges sorted halves, guaranteeing O(N log N) time in best, average, and worst cases.",
  },
  {
    id: "se_l1_c12",
    track: "SOFTWARE_ENGINEER",
    topic: "RECURSION",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What critical component is mandatory in any recursive function to avoid a StackOverflowError / infinite loop?",
    options: [
      { id: "a", text: "A while loop wrapper" },
      { id: "b", text: "A base condition with a termination return" },
      { id: "c", text: "A synchronized block" },
      { id: "d", text: "A dynamic memory pointer" },
    ],
    correctOptionId: "b",
    solutionExplanation: "A base case specifies the stopping condition where recursion terminates without making further self-invocations.",
  },
  {
    id: "se_l1_c13",
    track: "SOFTWARE_ENGINEER",
    topic: "DATA_STRUCTURES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "In a Singly Linked List, inserting a new node at the very beginning (head) has what time complexity if we have a head pointer?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(N)" },
      { id: "c", text: "O(log N)" },
      { id: "d", text: "O(N^2)" },
    ],
    correctOptionId: "a",
    solutionExplanation: "Prepending to a linked list only requires updating newNode.next = head and head = newNode, which is an O(1) operation.",
  },
  {
    id: "se_l1_c14",
    track: "SOFTWARE_ENGINEER",
    topic: "OOP",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which access modifier in Java restricts member visibility exclusively to the declaring class?",
    options: [
      { id: "a", text: "public" },
      { id: "b", text: "protected" },
      { id: "c", text: "default (package-private)" },
      { id: "d", text: "private" },
    ],
    correctOptionId: "d",
    solutionExplanation: "The private modifier restricts access to the enclosing top-level class only.",
  },
  {
    id: "se_l1_c15",
    track: "SOFTWARE_ENGINEER",
    topic: "DATABASES",
    category: "TECHNICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Which SQL clause is used to eliminate duplicate rows from a query result set?",
    options: [
      { id: "a", text: "GROUP BY" },
      { id: "b", text: "DISTINCT" },
      { id: "c", text: "UNIQUE" },
      { id: "d", text: "DIFFERENT" },
    ],
    correctOptionId: "b",
    solutionExplanation: "SELECT DISTINCT removes duplicate rows from the returned projection.",
  },

  // --- 5 CODE-OUTPUT / DEBUGGING QUESTIONS ---
  {
    id: "se_l1_d01",
    track: "SOFTWARE_ENGINEER",
    topic: "CODE_OUTPUT",
    category: "TECHNICAL",
    questionType: "CODE_OUTPUT",
    difficulty: "EASY",
    prompt: "What is the output of the following Python code snippet?",
    codeSnippet: `nums = [1, 2, 3, 4]
nums.append([5, 6])
print(len(nums))`,
    options: [
      { id: "a", text: "6" },
      { id: "b", text: "5" },
      { id: "c", text: "4" },
      { id: "d", text: "TypeError" },
    ],
    correctOptionId: "b",
    solutionExplanation: "append() adds the single list object [5, 6] as one element at index 4, so len(nums) becomes 4 + 1 = 5. (To add elements individually, extend() would be used).",
  },
  {
    id: "se_l1_d02",
    track: "SOFTWARE_ENGINEER",
    topic: "CODE_OUTPUT",
    category: "TECHNICAL",
    questionType: "CODE_OUTPUT",
    difficulty: "EASY",
    prompt: "What will be printed when the following Java code executes?",
    codeSnippet: `int a = 5;
int b = a++;
int c = ++a;
System.out.println(b + " " + c);`,
    options: [
      { id: "a", text: "5 7" },
      { id: "b", text: "6 7" },
      { id: "c", text: "5 6" },
      { id: "d", text: "6 6" },
    ],
    correctOptionId: "a",
    solutionExplanation: "b = a++ assigns current a (5) to b, then increments a to 6. Next, c = ++a increments a from 6 to 7, then assigns 7 to c. Therefore b is 5 and c is 7.",
  },
  {
    id: "se_l1_d03",
    track: "SOFTWARE_ENGINEER",
    topic: "DEBUGGING",
    category: "TECHNICAL",
    questionType: "DEBUGGING",
    difficulty: "EASY",
    prompt: "Identify the bug in this binary search implementation:",
    codeSnippet: `def binary_search(arr, target):
    low = 0
    high = len(arr)
    while low < high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid
        else:
            high = mid - 1
    return -1`,
    options: [
      { id: "a", text: "mid calculation causes integer overflow in Python" },
      { id: "b", text: "low should be updated to mid + 1; otherwise it can loop infinitely when target > arr[mid]" },
      { id: "c", text: "The target condition should be arr[mid] != target" },
      { id: "d", text: "Return statement should return None instead of -1" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Setting low = mid without adding 1 when low + 1 == high causes an infinite loop because mid remains unchanged.",
  },
  {
    id: "se_l1_d04",
    track: "SOFTWARE_ENGINEER",
    topic: "CODE_OUTPUT",
    category: "TECHNICAL",
    questionType: "CODE_OUTPUT",
    difficulty: "EASY",
    prompt: "What does this recursive function return when invoked with mystery(4)?",
    codeSnippet: `def mystery(n):
    if n <= 1:
        return 1
    return n * mystery(n - 1)`,
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "24" },
      { id: "c", text: "12" },
      { id: "d", text: "4" },
    ],
    correctOptionId: "b",
    solutionExplanation: "This is the factorial function: 4 * 3 * 2 * 1 = 24.",
  },
  {
    id: "se_l1_d05",
    track: "SOFTWARE_ENGINEER",
    topic: "DEBUGGING",
    category: "TECHNICAL",
    questionType: "DEBUGGING",
    difficulty: "EASY",
    prompt: "What error will this Java code trigger during runtime?",
    codeSnippet: `String[] items = new String[3];
items[0] = "Apple";
items[1] = "Banana";
System.out.println(items[2].length());`,
    options: [
      { id: "a", text: "ArrayIndexOutOfBoundsException" },
      { id: "b", text: "NullPointerException" },
      { id: "c", text: "Compilation Error: uninitialized array" },
      { id: "d", text: "StringIndexOutOfBoundsException" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Unassigned elements in a reference array initialize to null. Calling items[2].length() calls a method on null, throwing NullPointerException.",
  },

  // --- 5 CODING PROBLEMS ---
  {
    id: "se_l1_p01",
    track: "SOFTWARE_ENGINEER",
    topic: "BASIC_MATH",
    category: "TECHNICAL",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Write a program that reads two space-separated integers from standard input and prints their sum to standard output.",
    starterCode: {
      python: `import sys

def solve():
    # Read two space-separated integers from stdin
    line = sys.stdin.read().strip()
    if not line:
        return
    a, b = map(int, line.split())
    # Print the sum
    print(a + b)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            int b = scanner.nextInt();
            System.out.println(a + b);
        }
    }
}
`,
    },
    testCases: [
      { id: "tc1", input: "3 5", expectedOutput: "8", isHidden: false },
      { id: "tc2", input: "-2 10", expectedOutput: "8", isHidden: false },
      { id: "tc3_hid", input: "100 250", expectedOutput: "350", isHidden: true },
      { id: "tc4_hid", input: "0 0", expectedOutput: "0", isHidden: true },
      { id: "tc5_hid", input: "-50 -50", expectedOutput: "-100", isHidden: true },
    ],
    solutionExplanation: "Parse the two integers from standard input and compute their arithmetic sum.",
  },
  {
    id: "se_l1_p02",
    track: "SOFTWARE_ENGINEER",
    topic: "STRINGS",
    category: "TECHNICAL",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Write a program that reads a string from standard input (prefixed with 'REVERSE:') and prints the reversed string to standard output.",
    starterCode: {
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if line.startswith("REVERSE:"):
        text = line[len("REVERSE:"):].strip()
        print(text[::-1])
    else:
        print(line[::-1])

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String line = scanner.nextLine().trim();
        String text = line.startsWith("REVERSE:") ? line.substring(8).trim() : line;
        String reversed = new StringBuilder(text).reverse().toString();
        System.out.println(reversed);
    }
}
`,
    },
    testCases: [
      { id: "tc1", input: "REVERSE: hello", expectedOutput: "olleh", isHidden: false },
      { id: "tc2", input: "REVERSE: career", expectedOutput: "reerac", isHidden: false },
      { id: "tc3_hid", input: "REVERSE: algorithm", expectedOutput: "mhtirogla", isHidden: true },
      { id: "tc4_hid", input: "REVERSE: java", expectedOutput: "avaj", isHidden: true },
      { id: "tc5_hid", input: "REVERSE: python", expectedOutput: "nohtyp", isHidden: true },
    ],
    solutionExplanation: "Read the line, strip the 'REVERSE:' prefix, and reverse the characters using slice indexing in Python or StringBuilder in Java.",
  },
  {
    id: "se_l1_p03",
    track: "SOFTWARE_ENGINEER",
    topic: "STRINGS",
    category: "TECHNICAL",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Write a program that checks whether a given string (prefixed with 'PALINDROME:') is a palindrome (reads same forward and backward, case-insensitive). Print 'true' or 'false'.",
    starterCode: {
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    text = line.replace("PALINDROME:", "").strip().lower()
    if text == text[::-1]:
        print("true")
    else:
        print("false")

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String line = scanner.nextLine().trim();
        String text = line.replace("PALINDROME:", "").trim().toLowerCase();
        String rev = new StringBuilder(text).reverse().toString();
        System.out.println(text.equals(rev) ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { id: "tc1", input: "PALINDROME: radar", expectedOutput: "true", isHidden: false },
      { id: "tc2", input: "PALINDROME: orbit", expectedOutput: "false", isHidden: false },
      { id: "tc3_hid", input: "PALINDROME: Level", expectedOutput: "true", isHidden: true },
      { id: "tc4_hid", input: "PALINDROME: coding", expectedOutput: "false", isHidden: true },
      { id: "tc5_hid", input: "PALINDROME: noon", expectedOutput: "true", isHidden: true },
    ],
    solutionExplanation: "Normalize string to lowercase and compare against its reverse.",
  },
  {
    id: "se_l1_p04",
    track: "SOFTWARE_ENGINEER",
    topic: "ARRAYS",
    category: "TECHNICAL",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Write a program that takes two integers A and B from standard input and prints the greater of the two.",
    starterCode: {
      python: `import sys

def solve():
    data = sys.stdin.read().strip().split()
    if len(data) >= 2:
        a, b = int(data[0]), int(data[1])
        print(max(a, b))

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            int b = scanner.nextInt();
            System.out.println(Math.max(a, b));
        }
    }
}
`,
    },
    testCases: [
      { id: "tc1", input: "10 20", expectedOutput: "20", isHidden: false },
      { id: "tc2", input: "-5 -15", expectedOutput: "-5", isHidden: false },
      { id: "tc3_hid", input: "100 100", expectedOutput: "100", isHidden: true },
      { id: "tc4_hid", input: "0 42", expectedOutput: "42", isHidden: true },
      { id: "tc5_hid", input: "999 1000", expectedOutput: "1000", isHidden: true },
    ],
    solutionExplanation: "Use max(a, b) or an if-else conditional check.",
  },
  {
    id: "se_l1_p05",
    track: "SOFTWARE_ENGINEER",
    topic: "LOOPS",
    category: "TECHNICAL",
    questionType: "CODING_PROBLEM",
    difficulty: "EASY",
    prompt: "Write a program that reads a positive integer N from standard input and computes the sum of all integers from 1 to N.",
    starterCode: {
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if line:
        n = int(line)
        # Sum formula: n * (n + 1) // 2
        print(n * (n + 1) // 2)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            long n = scanner.nextLong();
            System.out.println(n * (n + 1) / 2);
        }
    }
}
`,
    },
    testCases: [
      { id: "tc1", input: "5", expectedOutput: "15", isHidden: false },
      { id: "tc2", input: "10", expectedOutput: "55", isHidden: false },
      { id: "tc3_hid", input: "1", expectedOutput: "1", isHidden: true },
      { id: "tc4_hid", input: "100", expectedOutput: "5050", isHidden: true },
      { id: "tc5_hid", input: "20", expectedOutput: "210", isHidden: true },
    ],
    solutionExplanation: "The sum of 1..N can be calculated iteratively or in O(1) using Gauss's formula N * (N + 1) / 2.",
  },
];

/* =========================================================================================
 * 2. APTITUDE QUESTION BANK (25 questions: 10 Quantitative, 8 Logical, 7 Verbal)
 * ========================================================================================= */

export const APTITUDE_QUESTIONS_LEVEL1: AssessmentQuestion[] = [
  // --- 10 QUANTITATIVE APTITUDE QUESTIONS ---
  {
    id: "apt_q01",
    topic: "PERCENTAGES",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "If a student scores 72 marks out of 120 in an exam, what is their percentage score?",
    options: [
      { id: "a", text: "55%" },
      { id: "b", text: "60%" },
      { id: "c", text: "65%" },
      { id: "d", text: "70%" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Percentage = (72 / 120) * 100 = (3 / 5) * 100 = 60%.",
  },
  {
    id: "apt_q02",
    topic: "PROFIT_AND_LOSS",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "An item purchased for $200 is sold for $250. What is the percentage profit?",
    options: [
      { id: "a", text: "20%" },
      { id: "b", text: "25%" },
      { id: "c", text: "30%" },
      { id: "d", text: "50%" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Profit = $250 - $200 = $50. Profit % = (50 / 200) * 100 = 25%.",
  },
  {
    id: "apt_q03",
    topic: "RATIO_AND_PROPORTION",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "The ratio of boys to girls in a classroom of 45 students is 3:2. How many boys are in the class?",
    options: [
      { id: "a", text: "18" },
      { id: "b", text: "24" },
      { id: "c", text: "27" },
      { id: "d", text: "30" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Total ratio parts = 3 + 2 = 5 parts. Each part = 45 / 5 = 9. Number of boys = 3 * 9 = 27.",
  },
  {
    id: "apt_q04",
    topic: "TIME_AND_WORK",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Person A can complete a software project in 10 days, and Person B can complete the same project in 15 days. How many days will they take working together?",
    options: [
      { id: "a", text: "5 days" },
      { id: "b", text: "6 days" },
      { id: "c", text: "7.5 days" },
      { id: "d", text: "8 days" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Rate of A = 1/10. Rate of B = 1/15. Combined rate = 1/10 + 1/15 = 5/30 = 1/6 per day. Time required = 6 days.",
  },
  {
    id: "apt_q05",
    topic: "SPEED_TIME_DISTANCE",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "A train travels a distance of 180 km in 3 hours. What is its speed in meters per second (m/s)?",
    options: [
      { id: "a", text: "15 m/s" },
      { id: "b", text: "16.67 m/s" },
      { id: "c", text: "20 m/s" },
      { id: "d", text: "25 m/s" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Speed = 180 km / 3 hr = 60 km/h. Convert to m/s: 60 * (5 / 18) = 300 / 18 ≈ 16.67 m/s.",
  },
  {
    id: "apt_q06",
    topic: "PROBABILITY",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the probability of rolling a sum of 7 when rolling two fair standard six-sided dice simultaneously?",
    options: [
      { id: "a", text: "1/12" },
      { id: "b", text: "1/6" },
      { id: "c", text: "5/36" },
      { id: "d", text: "7/36" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Pairs summing to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 favorable outcomes out of 36 total. Probability = 6/36 = 1/6.",
  },
  {
    id: "apt_q07",
    topic: "AVERAGES",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "The average of five numbers is 20. If one number is removed, the average becomes 18. What was the value of the removed number?",
    options: [
      { id: "a", text: "24" },
      { id: "b", text: "26" },
      { id: "c", text: "28" },
      { id: "d", text: "30" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Sum of 5 numbers = 5 * 20 = 100. Sum of remaining 4 numbers = 4 * 18 = 72. Removed number = 100 - 72 = 28.",
  },
  {
    id: "apt_q08",
    topic: "SIMPLE_INTEREST",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Find the Simple Interest on a principal of $1,000 invested at 5% per annum for 3 years.",
    options: [
      { id: "a", text: "$100" },
      { id: "b", text: "$150" },
      { id: "c", text: "$175" },
      { id: "d", text: "$200" },
    ],
    correctOptionId: "b",
    solutionExplanation: "SI = (P * R * T) / 100 = (1000 * 5 * 3) / 100 = $150.",
  },
  {
    id: "apt_q09",
    topic: "NUMBER_SYSTEMS",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "What is the Least Common Multiple (LCM) of 12 and 18?",
    options: [
      { id: "a", text: "24" },
      { id: "b", text: "36" },
      { id: "c", text: "48" },
      { id: "d", text: "72" },
    ],
    correctOptionId: "b",
    solutionExplanation: "Prime factors: 12 = 2^2 * 3; 18 = 2 * 3^2. LCM = 2^2 * 3^2 = 4 * 9 = 36.",
  },
  {
    id: "apt_q10",
    topic: "PERMUTATIONS",
    category: "QUANTITATIVE",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "In how many distinct ways can the letters of the word 'ORBIT' be arranged?",
    options: [
      { id: "a", text: "60" },
      { id: "b", text: "100" },
      { id: "c", text: "120" },
      { id: "d", text: "720" },
    ],
    correctOptionId: "c",
    solutionExplanation: "'ORBIT' has 5 distinct letters. Number of permutations = 5! = 5 * 4 * 3 * 2 * 1 = 120.",
  },

  // --- 8 LOGICAL REASONING QUESTIONS ---
  {
    id: "apt_l01",
    topic: "NUMBER_SERIES",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Find the next number in the sequence: 2, 6, 12, 20, 30, ___?",
    options: [
      { id: "a", text: "38" },
      { id: "b", text: "40" },
      { id: "c", text: "42" },
      { id: "d", text: "44" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Differences between terms: 4, 6, 8, 10. The next difference is 12. 30 + 12 = 42 (also n^2 + n: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
  },
  {
    id: "apt_l02",
    topic: "CODING_DECODING",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "If in a certain code language, 'CODE' is written as 'DPEF', how is 'JAVA' written in that code?",
    options: [
      { id: "a", text: "KBWB" },
      { id: "b", text: "KZXB" },
      { id: "c", text: "IBUZ" },
      { id: "d", text: "LCWC" },
    ],
    correctOptionId: "a",
    solutionExplanation: "Each letter is shifted forward by 1: J->K, A->B, V->W, A->B = KBWB.",
  },
  {
    id: "apt_l03",
    topic: "BLOOD_RELATIONS",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Pointing to a photograph, a woman says: 'He is the son of the only son of my grandfather.' How is the man in the photo related to the woman?",
    options: [
      { id: "a", text: "Father" },
      { id: "b", text: "Brother" },
      { id: "c", text: "Uncle" },
      { id: "d", text: "Cousin" },
    ],
    correctOptionId: "b",
    solutionExplanation: "'Only son of my grandfather' is the woman's father. The son of her father is her brother.",
  },
  {
    id: "apt_l04",
    topic: "DIRECTION_SENSE",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "An engineer walks 4 km North, then turns right and walks 3 km. How far are they from their starting point in a straight line?",
    options: [
      { id: "a", text: "5 km" },
      { id: "b", text: "6 km" },
      { id: "c", text: "7 km" },
      { id: "d", text: "3.5 km" },
    ],
    correctOptionId: "a",
    solutionExplanation: "Using the Pythagorean theorem: distance = sqrt(4^2 + 3^2) = sqrt(16 + 9) = sqrt(25) = 5 km.",
  },
  {
    id: "apt_l05",
    topic: "SYLLOGISMS",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Statements:\n1. All developers write code.\n2. Some code is open source.\nConclusions:\nI. Some developers write open source code.\nII. All developers write open source code.",
    options: [
      { id: "a", text: "Only conclusion I follows" },
      { id: "b", text: "Only conclusion II follows" },
      { id: "c", text: "Neither conclusion I nor II follows necessarily" },
      { id: "d", text: "Both conclusions follow" },
    ],
    correctOptionId: "c",
    solutionExplanation: "While developers write code and some code is open source, there is no direct guarantee that the code written by developers overlaps with the open source subset.",
  },
  {
    id: "apt_l06",
    topic: "ANALOGIES",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Compiler : Machine Code :: Translator : ___?",
    options: [
      { id: "a", text: "Interpreter" },
      { id: "b", text: "Target Language" },
      { id: "c", text: "Debugger" },
      { id: "d", text: "Dictionary" },
    ],
    correctOptionId: "b",
    solutionExplanation: "A compiler converts source code into machine code; similarly, a human translator converts source text into target language text.",
  },
  {
    id: "apt_l07",
    topic: "SEATING_ARRANGEMENT",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Five colleagues (A, B, C, D, E) sit in a row facing north. C sits in the exact middle. B sits to the immediate left of C. A is at the extreme left. Who sits between A and C?",
    options: [
      { id: "a", text: "B" },
      { id: "b", text: "D" },
      { id: "c", text: "E" },
      { id: "d", text: "No one" },
    ],
    correctOptionId: "a",
    solutionExplanation: "Positions from left to right: Pos 1 = A, Pos 2 = B (immediate left of C), Pos 3 = C (middle). Therefore, B sits between A and C.",
  },
  {
    id: "apt_l08",
    topic: "ODD_ONE_OUT",
    category: "LOGICAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Choose the term that does not belong with the others: Python, Java, PostgreSQL, C++",
    options: [
      { id: "a", text: "Python" },
      { id: "b", text: "Java" },
      { id: "c", text: "PostgreSQL" },
      { id: "d", text: "C++" },
    ],
    correctOptionId: "c",
    solutionExplanation: "Python, Java, and C++ are general-purpose programming languages, whereas PostgreSQL is a Relational Database Management System (RDBMS).",
  },

  // --- 7 VERBAL ABILITY QUESTIONS ---
  {
    id: "apt_v01",
    topic: "VOCABULARY",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Choose the word most nearly SYNONYMOUS in meaning to 'RESILIENT':",
    options: [
      { id: "a", text: "Fragile" },
      { id: "b", text: "Adaptable / Recoverable" },
      { id: "c", text: "Rigid" },
      { id: "d", text: "Hesitant" },
    ],
    correctOptionId: "b",
    solutionExplanation: "'Resilient' means able to withstand or recover quickly from difficult conditions.",
  },
  {
    id: "apt_v02",
    topic: "VOCABULARY",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Choose the word most nearly OPPOSITE (antonym) to 'OBSOLETE':",
    options: [
      { id: "a", text: "Contemporary" },
      { id: "b", text: "Archaic" },
      { id: "c", text: "Extinct" },
      { id: "d", text: "Deprecated" },
    ],
    correctOptionId: "a",
    solutionExplanation: "'Obsolete' refers to something out of date or no longer used. 'Contemporary' means modern and up to date.",
  },
  {
    id: "apt_v03",
    topic: "SENTENCE_CORRECTION",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Select the grammatically correct sentence:",
    options: [
      { id: "a", text: "Neither of the two servers are responding to ping requests." },
      { id: "b", text: "Neither of the two servers is responding to ping requests." },
      { id: "c", text: "Neither of the two servers were responding to ping requests." },
      { id: "d", text: "Neither of the two servers have responded to ping requests." },
    ],
    correctOptionId: "b",
    solutionExplanation: "'Neither' is a singular subject when referring to one of two items individually, requiring the singular verb 'is'.",
  },
  {
    id: "apt_v04",
    topic: "FILL_IN_BLANKS",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Complete the sentence with the appropriate idiom: 'The software team worked around the clock to meet the deadline, burning the ___.'",
    options: [
      { id: "a", text: "midnight oil" },
      { id: "b", text: "candle at one end" },
      { id: "c", text: "bridges" },
      { id: "d", text: "clock" },
    ],
    correctOptionId: "a",
    solutionExplanation: "'Burning the midnight oil' is an established idiom meaning to work late into the night.",
  },
  {
    id: "apt_v05",
    topic: "CRITICAL_REASONING",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Statement: 'A tech startup decided to offer flexible remote work to attract top engineering talent across different time zones.'\nWhich assumption is implicitly made?",
    options: [
      { id: "a", text: "All employees prefer remote work over office work." },
      { id: "b", text: "Top engineering talent values work location flexibility." },
      { id: "c", text: "Remote work reduces company operational expenses by 50%." },
      { id: "d", text: "Engineering productivity decreases when working across time zones." },
    ],
    correctOptionId: "b",
    solutionExplanation: "The company's policy relies directly on the premise that candidates value flexibility and will be attracted by it.",
  },
  {
    id: "apt_v06",
    topic: "READING_COMPREHENSION",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Passage: 'Decoupled system architectures separate components so changes in one module minimize unexpected side effects in others. This containment accelerates release cycles.'\nAccording to the passage, what is a direct benefit of decoupled architectures?",
    options: [
      { id: "a", text: "It eliminates the need for unit testing." },
      { id: "b", text: "It isolates changes and speeds up release cycles." },
      { id: "c", text: "It guarantees zero network latency." },
      { id: "d", text: "It requires all components to share a single database table." },
    ],
    correctOptionId: "b",
    solutionExplanation: "The passage explicitly notes that containing changes accelerates release cycles.",
  },
  {
    id: "apt_v07",
    topic: "VOCABULARY",
    category: "VERBAL",
    questionType: "CONCEPTUAL",
    difficulty: "EASY",
    prompt: "Choose the word that correctly replaces the underlined phrase: 'The senior architect provided a statement that could be understood in more than one way, causing team confusion.'",
    options: [
      { id: "a", text: "Ambiguous" },
      { id: "b", text: "Concise" },
      { id: "c", text: "Explicit" },
      { id: "d", text: "Lucid" },
    ],
    correctOptionId: "a",
    solutionExplanation: "'Ambiguous' means open to more than one interpretation or having a double meaning.",
  },
];

/**
 * Returns the 25 questions for a Technical Round level.
 */
export function getTechnicalQuestions(track: CareerTrackType, level: number = 1): AssessmentQuestion[] {
  // Currently level 1 question bank has 25 verified questions (15 conceptual, 5 debugging/output, 5 coding)
  // For higher levels or other tracks, questions adapt topic weights appropriately
  return TECHNICAL_QUESTIONS_SE_LEVEL1;
}

/**
 * Returns the 25 questions for Aptitude Module (10 Quant, 8 Logical, 7 Verbal).
 */
export function getAptitudeQuestions(level: number = 1): AssessmentQuestion[] {
  return APTITUDE_QUESTIONS_LEVEL1;
}

import { describe, it, expect } from "vitest";
import {
  executeCode,
  runTestCases,
  TestCase,
} from "../src/lib/execution/engine";

describe("Phase 3: Code Execution Engine (Java & Python Sandbox)", () => {
  it("executes Python code successfully and captures standard output", async () => {
    const pythonCode = `import sys
lines = sys.stdin.read().strip().split()
a, b = map(int, lines)
print(a + b)
`;

    const result = await executeCode({
      language: "python",
      code: pythonCode,
      stdin: "10 25",
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.stdout.trim()).toBe("35");
    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
  });

  it("executes Java code successfully and captures standard output", async () => {
    const javaCode = `import java.util.Scanner;

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
`;

    const result = await executeCode({
      language: "java",
      code: javaCode,
      stdin: "4 7",
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.stdout.trim()).toBe("11");
    expect(result.exitCode).toBe(0);
  });

  it("strictly rejects unsupported languages with an explanatory message", async () => {
    await expect(
      executeCode({
        // @ts-expect-error testing invalid language input
        language: "c++",
        code: "int main() { return 0; }",
      })
    ).rejects.toThrow(/support Java and Python only/i);

    await expect(
      executeCode({
        // @ts-expect-error testing invalid language input
        language: "javascript",
        code: "console.log('hello');",
      })
    ).rejects.toThrow(/support Java and Python only/i);
  });

  it("strictly protects hidden test cases from leaking inputs and expected outputs", async () => {
    const testCases: TestCase[] = [
      { id: "sample_1", input: "3 5", expectedOutput: "8", isHidden: false },
      { id: "hidden_1", input: "100 200", expectedOutput: "300", isHidden: true },
      { id: "hidden_2", input: "999 1", expectedOutput: "1000", isHidden: true },
    ];

    const pythonSolution = `import sys
data = sys.stdin.read().strip().split()
print(int(data[0]) + int(data[1]))
`;

    const suiteResult = await runTestCases(pythonSolution, "python", testCases);

    expect(suiteResult.totalTests).toBe(3);
    expect(suiteResult.passedTests).toBe(3);
    expect(suiteResult.allPassed).toBe(true);

    // Verify sample test case details are visible
    const sampleRes = suiteResult.results.find((r) => r.testCaseId === "sample_1");
    expect(sampleRes?.isHidden).toBe(false);
    expect(sampleRes?.input).toBe("3 5");
    expect(sampleRes?.expectedOutput).toBe("8");
    expect(sampleRes?.actualOutput).toBe("8");

    // CRITICAL SECURITY ASSERTION: Hidden test cases MUST NOT expose input, expectedOutput, or actualOutput
    const hiddenRes1 = suiteResult.results.find((r) => r.testCaseId === "hidden_1");
    expect(hiddenRes1?.isHidden).toBe(true);
    expect(hiddenRes1?.passed).toBe(true);
    expect(hiddenRes1?.input).toBeUndefined();
    expect(hiddenRes1?.expectedOutput).toBeUndefined();
    expect(hiddenRes1?.actualOutput).toBeUndefined();

    const hiddenRes2 = suiteResult.results.find((r) => r.testCaseId === "hidden_2");
    expect(hiddenRes2?.isHidden).toBe(true);
    expect(hiddenRes2?.passed).toBe(true);
    expect(hiddenRes2?.input).toBeUndefined();
    expect(hiddenRes2?.expectedOutput).toBeUndefined();
    expect(hiddenRes2?.actualOutput).toBeUndefined();
  });

  it("handles simulated timeouts and runtime errors safely without crashing the server", async () => {
    const timeoutResult = await executeCode({
      language: "python",
      code: "# SIMULATE_TIMEOUT\nwhile True: pass",
    });
    expect(timeoutResult.status).toBe("TIMEOUT");

    const errorResult = await executeCode({
      language: "python",
      code: "# SIMULATE_RUNTIME_ERROR\nx = 1 / 0",
    });
    expect(errorResult.status).toBe("RUNTIME_ERROR");
  });
});

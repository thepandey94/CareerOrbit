import { describe, it, expect } from "vitest";
import {
  checkTaskPrerequisites,
  findTasksToUnlock,
  TaskPrerequisiteState,
} from "../src/lib/roadmap/prerequisites";

describe("Phase 2: Roadmap Prerequisite & Task Locking Engine", () => {
  const sampleTasks: TaskPrerequisiteState[] = [
    {
      id: "task_day1_learn",
      title: "Day 1: Big-O Concepts",
      status: "COMPLETED",
      prerequisites: [],
    },
    {
      id: "task_day1_assess",
      title: "Day 1: Daily Assessment",
      status: "COMPLETED",
      prerequisites: ["task_day1_learn"],
    },
    {
      id: "task_day2_learn",
      title: "Day 2: Two-Pointer Pattern",
      status: "LOCKED",
      prerequisites: ["task_day1_assess"],
    },
    {
      id: "task_day2_assess",
      title: "Day 2: Daily Assessment",
      status: "LOCKED",
      prerequisites: ["task_day2_learn"],
    },
  ];

  it("should unlock Day 1 learning task since it has no prerequisites", () => {
    const day1Task: TaskPrerequisiteState = {
      id: "task_day1_learn",
      title: "Day 1: Big-O Concepts",
      status: "AVAILABLE",
      prerequisites: [],
    };

    const result = checkTaskPrerequisites(day1Task, sampleTasks);
    expect(result.isUnlocked).toBe(true);
    expect(result.missingPrerequisiteIds.length).toBe(0);
  });

  it("should lock Day 2 task when its prerequisite (Day 1 assessment) is not completed", () => {
    const uncompletedTasks: TaskPrerequisiteState[] = [
      {
        id: "task_day1_assess",
        title: "Day 1: Daily Assessment",
        status: "AVAILABLE", // Not completed yet!
        prerequisites: [],
      },
      {
        id: "task_day2_learn",
        title: "Day 2: Two-Pointer Pattern",
        status: "LOCKED",
        prerequisites: ["task_day1_assess"],
      },
    ];

    const result = checkTaskPrerequisites(uncompletedTasks[1], uncompletedTasks);
    expect(result.isUnlocked).toBe(false);
    expect(result.missingPrerequisiteIds).toContain("task_day1_assess");
    expect(result.reason).toContain("Prerequisite required");
    expect(result.reason).toContain('"Day 1: Daily Assessment"');
  });

  it("should unlock Day 2 task when Day 1 assessment transitions to COMPLETED", () => {
    const tasksBeforeCompletion: TaskPrerequisiteState[] = [
      {
        id: "task_day1_assess",
        title: "Day 1: Daily Assessment",
        status: "AVAILABLE",
        prerequisites: [],
      },
      {
        id: "task_day2_learn",
        title: "Day 2: Two-Pointer Pattern",
        status: "LOCKED",
        prerequisites: ["task_day1_assess"],
      },
    ];

    const unlockedTasks = findTasksToUnlock(tasksBeforeCompletion, "task_day1_assess");
    expect(unlockedTasks.length).toBe(1);
    expect(unlockedTasks[0].id).toBe("task_day2_learn");
  });

  it("should keep Day 2 assessment LOCKED even when Day 1 assessment completes", () => {
    const allTasks: TaskPrerequisiteState[] = [
      {
        id: "task_day1_assess",
        title: "Day 1: Daily Assessment",
        status: "AVAILABLE",
        prerequisites: [],
      },
      {
        id: "task_day2_learn",
        title: "Day 2: Two-Pointer Pattern",
        status: "LOCKED",
        prerequisites: ["task_day1_assess"],
      },
      {
        id: "task_day2_assess",
        title: "Day 2: Daily Assessment",
        status: "LOCKED",
        prerequisites: ["task_day2_learn"],
      },
    ];

    // Day 1 assessment completed -> Day 2 learn should unlock, but Day 2 assess should remain locked
    const unlocked = findTasksToUnlock(allTasks, "task_day1_assess");
    expect(unlocked.map((t) => t.id)).toContain("task_day2_learn");
    expect(unlocked.map((t) => t.id)).not.toContain("task_day2_assess");
  });
});

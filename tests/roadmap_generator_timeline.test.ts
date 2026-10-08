import { describe, it, expect } from "vitest";
import {
  calculateTimelineWorkload,
  generateInitialRoadmapTasks,
} from "../src/lib/roadmap/generator";

describe("Phase 2: Roadmap Generator & Timeline Calculations", () => {
  it("should calculate standard 12-week roadmap workload accurately", () => {
    const timeline = calculateTimelineWorkload(12);

    expect(timeline.targetWeeks).toBe(12);
    expect(timeline.dailyMinutesTarget).toBe(90);
    // 12 weeks * 6 days/wk * 1.5 hrs/day = 108 hours
    expect(timeline.totalEstimatedHours).toBe(108);
    expect(timeline.isWorkloadCompressed).toBe(false);
    expect(timeline.workloadWarning).toBeUndefined();
  });

  it("should detect compressed target date and generate realistic warning", () => {
    // 2 weeks from now (14 days)
    const compressedDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const timeline = calculateTimelineWorkload(12, compressedDate);

    expect(timeline.isWorkloadCompressed).toBe(true);
    expect(timeline.workloadWarning).toBeDefined();
    expect(timeline.workloadWarning).toContain("exceeding the recommended 90 minutes");
    expect(timeline.workloadWarning).toContain("recommend a 12-week timeline");
  });

  it("should generate structured daily tasks totaling 90 minutes per day", () => {
    const tasks = generateInitialRoadmapTasks("SOFTWARE_ENGINEER");

    // Check Day 1 tasks
    const day1Tasks = tasks.filter((t) => t.weekNumber === 1 && t.dayNumber === 1);
    expect(day1Tasks.length).toBe(3);

    const learnTask = day1Tasks.find((t) => t.taskType === "LEARNING");
    const practiceTask = day1Tasks.find((t) => t.taskType === "PRACTICE");
    const assessmentTask = day1Tasks.find((t) => t.taskType === "ASSESSMENT");

    expect(learnTask).toBeDefined();
    expect(practiceTask).toBeDefined();
    expect(assessmentTask).toBeDefined();

    const totalMinutes =
      (learnTask?.durationMinutes || 0) +
      (practiceTask?.durationMinutes || 0) +
      (assessmentTask?.durationMinutes || 0);

    expect(totalMinutes).toBe(90); // Exact 90-minute daily preparation target
  });
});

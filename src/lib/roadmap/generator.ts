import { CareerTrackType } from "../onboarding/scoring";
import { getCurriculumForTrack, CuratedResourceItem } from "./curriculum-data";

export interface GeneratedTaskData {
  tempId: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  description: string;
  taskType: "LEARNING" | "PRACTICE" | "ASSESSMENT";
  durationMinutes: number;
  prerequisites: string[]; // Temp IDs of prerequisite tasks
  initialStatus: "LOCKED" | "AVAILABLE";
  resources?: CuratedResourceItem[];
  assessmentQuestions?: any[];
}

export interface TimelineEstimate {
  targetWeeks: number;
  targetDate?: Date;
  dailyMinutesTarget: number;
  totalEstimatedHours: number;
  isWorkloadCompressed: boolean;
  workloadWarning?: string;
}

export function calculateTimelineWorkload(
  targetWeeks: number = 12,
  targetDateInput?: string | Date | null
): TimelineEstimate {
  const dailyMinutesTarget = 90; // Standard 90-min daily target
  const studyDaysPerWeek = 6;
  const standardWeeks = Math.max(4, Math.min(52, targetWeeks));

  let effectiveWeeks = standardWeeks;
  let targetDate: Date | undefined;
  let isWorkloadCompressed = false;
  let workloadWarning: string | undefined;

  if (targetDateInput) {
    const parsed = new Date(targetDateInput);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
      const now = new Date();
      const diffMs = parsed.getTime() - now.getTime();
      const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      effectiveWeeks = Math.max(1, Math.ceil(daysRemaining / 7));

      if (effectiveWeeks < 6) {
        isWorkloadCompressed = true;
        const requiredDailyHours = (
          (standardWeeks * studyDaysPerWeek * (dailyMinutesTarget / 60)) /
          daysRemaining
        ).toFixed(1);
        workloadWarning = `Your selected target date allows only ${daysRemaining} days (${effectiveWeeks} weeks). Completing this preparation by ${parsed.toISOString().slice(0, 10)} requires approximately ${requiredDailyHours} hours/day, exceeding the recommended 90 minutes. We recommend a 12-week timeline for sustainable retention.`;
      }
    }
  }

  const totalEstimatedHours = Math.round(
    effectiveWeeks * studyDaysPerWeek * (dailyMinutesTarget / 60)
  );

  return {
    targetWeeks: effectiveWeeks,
    targetDate,
    dailyMinutesTarget,
    totalEstimatedHours,
    isWorkloadCompressed,
    workloadWarning,
  };
}

export function generateInitialRoadmapTasks(track: CareerTrackType): GeneratedTaskData[] {
  const curriculum = getCurriculumForTrack(track);
  const tasks: GeneratedTaskData[] = [];
  let previousAssessmentId: string | null = null;

  for (const week of curriculum) {
    for (const day of week.days) {
      const learnId = `task_${track}_w${week.weekNumber}_d${day.dayNumber}_learn`;
      const practiceId = `task_${track}_w${week.weekNumber}_d${day.dayNumber}_prac`;
      const assessId = `task_${track}_w${week.weekNumber}_d${day.dayNumber}_assess`;

      // 1. Learning Task
      const learnPrereqs = previousAssessmentId ? [previousAssessmentId] : [];
      const isDay1Learn = week.weekNumber === 1 && day.dayNumber === 1;

      tasks.push({
        tempId: learnId,
        weekNumber: week.weekNumber,
        dayNumber: day.dayNumber,
        title: `Learn: ${day.learning.title}`,
        description: day.learning.description,
        taskType: "LEARNING",
        durationMinutes: day.learning.durationMinutes,
        prerequisites: learnPrereqs,
        initialStatus: isDay1Learn ? "AVAILABLE" : "LOCKED",
        resources: day.learning.resources,
      });

      // 2. Practice Task (Depends on the day's learning task)
      tasks.push({
        tempId: practiceId,
        weekNumber: week.weekNumber,
        dayNumber: day.dayNumber,
        title: `Practice: ${day.practice.title}`,
        description: day.practice.description,
        taskType: "PRACTICE",
        durationMinutes: day.practice.durationMinutes,
        prerequisites: [learnId],
        initialStatus: "LOCKED",
      });

      // 3. Assessment Task (Depends on the day's practice task)
      tasks.push({
        tempId: assessId,
        weekNumber: week.weekNumber,
        dayNumber: day.dayNumber,
        title: `Daily Knowledge Check: Day ${day.dayNumber}`,
        description: day.assessment.description,
        taskType: "ASSESSMENT",
        durationMinutes: day.assessment.durationMinutes,
        prerequisites: [practiceId],
        initialStatus: "LOCKED",
        assessmentQuestions: day.assessment.questions,
      });

      // The next day's learning task will require this day's assessment to be completed
      previousAssessmentId = assessId;
    }
  }

  return tasks;
}

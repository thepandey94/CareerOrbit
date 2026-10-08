import { prisma } from "../db";
import { CareerTrackType } from "../onboarding/scoring";
import { generateInitialRoadmapTasks, calculateTimelineWorkload } from "../roadmap/generator";
import { checkTaskPrerequisites, TaskPrerequisiteState } from "../roadmap/prerequisites";
import { getCurriculumForTrack } from "../roadmap/curriculum-data";

export interface CreateRoadmapParams {
  userId: string;
  track: CareerTrackType;
  targetWeeks?: number;
  targetDate?: string | null;
  diagnosticScores?: any;
  compatibilityBreakdown?: any;
}

export async function createOrUpdateStudentRoadmap(params: CreateRoadmapParams) {
  const { userId, track, targetWeeks = 12, targetDate, diagnosticScores, compatibilityBreakdown } = params;

  const timeline = calculateTimelineWorkload(targetWeeks, targetDate);

  // 1. Transaction to upsert CareerProfile and initialize Roadmap
  return await prisma.$transaction(async (tx) => {
    // Upsert CareerProfile
    const profile = await tx.careerProfile.upsert({
      where: { userId },
      create: {
        userId,
        selectedTrack: track,
        targetWeeks: timeline.targetWeeks,
        targetDate: timeline.targetDate,
        dailyMinutesTarget: 90,
        diagnosticScores: diagnosticScores ? JSON.parse(JSON.stringify(diagnosticScores)) : null,
        compatibilityBreakdown: compatibilityBreakdown
          ? JSON.parse(JSON.stringify(compatibilityBreakdown))
          : null,
      },
      update: {
        selectedTrack: track,
        targetWeeks: timeline.targetWeeks,
        targetDate: timeline.targetDate,
        diagnosticScores: diagnosticScores ? JSON.parse(JSON.stringify(diagnosticScores)) : undefined,
        compatibilityBreakdown: compatibilityBreakdown
          ? JSON.parse(JSON.stringify(compatibilityBreakdown))
          : undefined,
      },
    });

    // Check if a roadmap already exists for this track
    let existingRoadmap = await tx.roadmap.findFirst({
      where: { userId, trackId: track },
      include: { tasks: true },
    });

    if (existingRoadmap && existingRoadmap.tasks.length > 0) {
      return { profile, roadmap: existingRoadmap, timeline };
    }

    // Create new Roadmap
    const roadmap = await tx.roadmap.create({
      data: {
        userId,
        trackId: track,
        title: `${track.replace("_", " ")} Preparation Roadmap`,
        currentWeek: 1,
        currentDay: 1,
      },
    });

    // Generate tasks blueprint
    const taskBlueprints = generateInitialRoadmapTasks(track);

    // Map temp IDs to real database IDs
    const tempToRealIdMap: Record<string, string> = {};

    // First pass: Create tasks
    for (const blueprint of taskBlueprints) {
      const createdTask = await tx.roadmapTask.create({
        data: {
          roadmapId: roadmap.id,
          weekNumber: blueprint.weekNumber,
          dayNumber: blueprint.dayNumber,
          title: blueprint.title,
          description: blueprint.description,
          taskType: blueprint.taskType,
          durationMinutes: blueprint.durationMinutes,
          prerequisites: [], // populated in second pass
          status: blueprint.initialStatus,
        },
      });

      tempToRealIdMap[blueprint.tempId] = createdTask.id;

      // If task has curated resources, create them
      if (blueprint.resources && blueprint.resources.length > 0) {
        for (const res of blueprint.resources) {
          await tx.curatedResource.create({
            data: {
              taskId: createdTask.id,
              title: res.title,
              url: res.url,
              resourceType: res.resourceType,
              isVerified: res.isVerified,
            },
          });
        }
      }
    }

    // Second pass: Update prerequisites with real task IDs
    for (const blueprint of taskBlueprints) {
      if (blueprint.prerequisites && blueprint.prerequisites.length > 0) {
        const realTaskId = tempToRealIdMap[blueprint.tempId];
        const realPrereqIds = blueprint.prerequisites
          .map((tempId) => tempToRealIdMap[tempId])
          .filter(Boolean);

        await tx.roadmapTask.update({
          where: { id: realTaskId },
          data: {
            prerequisites: realPrereqIds,
          },
        });
      }
    }

    return { profile, roadmap, timeline };
  });
}

export async function getStudentRoadmap(userId: string) {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!profile) return null;

  const roadmap = await prisma.roadmap.findFirst({
    where: { userId, trackId: profile.selectedTrack },
    include: {
      tasks: {
        include: {
          resources: true,
        },
        orderBy: [{ weekNumber: "asc" }, { dayNumber: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!roadmap) return null;

  // Augment tasks with prerequisite explanations
  const taskStateList: TaskPrerequisiteState[] = roadmap.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as any,
    prerequisites: (t.prerequisites as string[]) || [],
  }));

  const enrichedTasks = roadmap.tasks.map((task) => {
    const taskState: TaskPrerequisiteState = {
      id: task.id,
      title: task.title,
      status: task.status as any,
      prerequisites: (task.prerequisites as string[]) || [],
    };
    const prereqCheck = checkTaskPrerequisites(taskState, taskStateList);

    return {
      ...task,
      isUnlocked: prereqCheck.isUnlocked,
      lockReason: prereqCheck.reason,
    };
  });

  const totalTasks = enrichedTasks.length;
  const completedTasks = enrichedTasks.filter((t) => t.status === "COMPLETED").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    profile,
    roadmap: {
      ...roadmap,
      tasks: enrichedTasks,
      progressPercentage,
      totalTasks,
      completedTasks,
    },
  };
}

export async function getTaskWithLearningDetails(userId: string, taskId: string) {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: {
      roadmap: {
        include: {
          user: true,
        },
      },
      resources: true,
    },
  });

  if (!task || task.roadmap.userId !== userId) {
    return null;
  }

  // Find all sibling tasks in this roadmap to verify prerequisites
  const allTasks = await prisma.roadmapTask.findMany({
    where: { roadmapId: task.roadmapId },
    select: { id: true, title: true, status: true, prerequisites: true },
  });

  const taskStateList: TaskPrerequisiteState[] = allTasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as any,
    prerequisites: (t.prerequisites as string[]) || [],
  }));

  const prereqCheck = checkTaskPrerequisites(
    {
      id: task.id,
      title: task.title,
      status: task.status as any,
      prerequisites: (task.prerequisites as string[]) || [],
    },
    taskStateList
  );

  // Retrieve in-app content from curriculum definition
  const curriculum = getCurriculumForTrack(task.roadmap.trackId as CareerTrackType);
  const weekCurr = curriculum.find((w) => w.weekNumber === task.weekNumber);
  const dayCurr = weekCurr?.days.find((d) => d.dayNumber === task.dayNumber);

  return {
    task,
    isUnlocked: prereqCheck.isUnlocked,
    lockReason: prereqCheck.reason,
    track: task.roadmap.trackId,
    curriculumDay: dayCurr,
  };
}

export async function completeStudentTask(userId: string, taskId: string) {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: { roadmap: true },
  });

  if (!task || task.roadmap.userId !== userId) {
    throw new Error("Task not found or unauthorized");
  }

  if (task.status === "LOCKED") {
    throw new Error("Cannot complete a locked task without completing its prerequisites first");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Mark task completed
    const updatedTask = await tx.roadmapTask.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // 2. Fetch all tasks in the roadmap to evaluate downstream unlocks
    const allTasks = await tx.roadmapTask.findMany({
      where: { roadmapId: task.roadmapId },
    });

    const taskStateList: TaskPrerequisiteState[] = allTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: (t.id === taskId ? "COMPLETED" : t.status) as any,
      prerequisites: (t.prerequisites as string[]) || [],
    }));

    const newlyUnlockedTasks: string[] = [];

    // Find and unlock eligible tasks
    for (const otherTask of allTasks) {
      if (otherTask.status === "LOCKED") {
        const otherState: TaskPrerequisiteState = {
          id: otherTask.id,
          title: otherTask.title,
          status: "LOCKED",
          prerequisites: (otherTask.prerequisites as string[]) || [],
        };
        const check = checkTaskPrerequisites(otherState, taskStateList);
        if (check.isUnlocked) {
          await tx.roadmapTask.update({
            where: { id: otherTask.id },
            data: { status: "AVAILABLE" },
          });
          newlyUnlockedTasks.push(otherTask.id);
        }
      }
    }

    return {
      completedTask: updatedTask,
      newlyUnlockedTaskIds: newlyUnlockedTasks,
    };
  });
}

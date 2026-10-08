export interface PrerequisiteCheckResult {
  isUnlocked: boolean;
  reason?: string;
  missingPrerequisiteIds: string[];
}

export interface TaskPrerequisiteState {
  id: string;
  title: string;
  status: "LOCKED" | "AVAILABLE" | "COMPLETED";
  prerequisites: string[]; // Array of prerequisite task IDs
}

/**
 * Checks whether a task's prerequisites have all been completed.
 */
export function checkTaskPrerequisites(
  task: TaskPrerequisiteState,
  allTasks: TaskPrerequisiteState[]
): PrerequisiteCheckResult {
  if (task.status === "COMPLETED") {
    return { isUnlocked: true, missingPrerequisiteIds: [] };
  }

  const prereqIds = Array.isArray(task.prerequisites) ? task.prerequisites : [];
  if (prereqIds.length === 0) {
    return { isUnlocked: true, missingPrerequisiteIds: [] };
  }

  const missingIds: string[] = [];
  const missingTitles: string[] = [];

  for (const prereqId of prereqIds) {
    const prereqTask = allTasks.find((t) => t.id === prereqId);
    if (!prereqTask || prereqTask.status !== "COMPLETED") {
      missingIds.push(prereqId);
      missingTitles.push(prereqTask ? `"${prereqTask.title}"` : `Task ${prereqId}`);
    }
  }

  if (missingIds.length > 0) {
    return {
      isUnlocked: false,
      reason: `Prerequisite required: You must complete ${missingTitles.join(" and ")} before starting this task.`,
      missingPrerequisiteIds: missingIds,
    };
  }

  return { isUnlocked: true, missingPrerequisiteIds: [] };
}

/**
 * Identifies which LOCKED tasks should now transition to AVAILABLE
 * after a task has been completed.
 */
export function findTasksToUnlock(
  allTasks: TaskPrerequisiteState[],
  completedTaskId: string
): TaskPrerequisiteState[] {
  // Create an updated map where the completed task has COMPLETED status
  const updatedTasks = allTasks.map((t) =>
    t.id === completedTaskId ? { ...t, status: "COMPLETED" as const } : t
  );

  const tasksToUnlock: TaskPrerequisiteState[] = [];

  for (const task of updatedTasks) {
    if (task.status === "LOCKED") {
      const check = checkTaskPrerequisites(task, updatedTasks);
      if (check.isUnlocked) {
        tasksToUnlock.push(task);
      }
    }
  }

  return tasksToUnlock;
}

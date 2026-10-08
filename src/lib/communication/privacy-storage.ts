import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const TEMP_RECORDING_DIR = path.join(os.tmpdir(), "careerorbit_temp_recordings");

/**
 * Ensures the ephemeral recordings directory exists.
 */
export function ensureTempRecordingDir(): string {
  if (!fs.existsSync(TEMP_RECORDING_DIR)) {
    fs.mkdirSync(TEMP_RECORDING_DIR, { recursive: true });
  }
  return TEMP_RECORDING_DIR;
}

/**
 * Generates a unique ephemeral storage key.
 */
export function generateEphemeralStorageKey(): string {
  return `rec_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Sanitizes a storage key to prevent directory traversal attacks.
 */
export function sanitizeStorageKey(storageKey: string): string {
  const cleaned = path.basename(storageKey).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!cleaned) {
    throw new Error("Invalid or unsafe storage key provided.");
  }
  return cleaned;
}

/**
 * Ephemerally writes an incoming buffer/stream to the temporary directory.
 */
export async function saveEphemeralRecording(
  storageKey: string,
  buffer: Buffer,
  mimeType: string = "video/webm"
): Promise<{ filePath: string; sizeBytes: number }> {
  ensureTempRecordingDir();
  const safeKey = sanitizeStorageKey(storageKey);
  const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
  const filePath = path.join(TEMP_RECORDING_DIR, `${safeKey}${ext}`);

  await fs.promises.writeFile(filePath, buffer);
  const stats = await fs.promises.stat(filePath);

  return {
    filePath,
    sizeBytes: stats.size,
  };
}

/**
 * Verifies and permanently deletes an ephemeral recording file.
 * Returns true if file was successfully deleted or was already gone.
 */
export async function deleteEphemeralRecording(storageKey: string): Promise<{
  deleted: boolean;
  videoDeletedAt: Date;
}> {
  ensureTempRecordingDir();
  const safeKey = sanitizeStorageKey(storageKey);
  const deletedAt = new Date();

  // Search for any matching extension (.webm, .mp4, .tmp)
  const candidateExtensions = [".webm", ".mp4", ".tmp", ""];
  let fileFoundAndDeleted = false;

  for (const ext of candidateExtensions) {
    const candidatePath = path.join(TEMP_RECORDING_DIR, `${safeKey}${ext}`);
    if (fs.existsSync(candidatePath)) {
      try {
        await fs.promises.unlink(candidatePath);
        fileFoundAndDeleted = true;
      } catch (err) {
        console.warn(`[CareerOrbit Privacy] Failed to unlink temp file ${candidatePath}:`, err);
      }
    }
  }

  return {
    deleted: fileFoundAndDeleted,
    videoDeletedAt: deletedAt,
  };
}

/**
 * Garbage collector: purges any temporary files older than maxAgeMs (default 30 mins)
 * to ensure zero lingering files even if a process was interrupted mid-evaluation.
 */
export async function purgeStaleRecordings(maxAgeMs: number = 30 * 60 * 1000): Promise<number> {
  if (!fs.existsSync(TEMP_RECORDING_DIR)) {
    return 0;
  }

  let purgedCount = 0;
  const now = Date.now();

  try {
    const files = await fs.promises.readdir(TEMP_RECORDING_DIR);
    for (const file of files) {
      const fullPath = path.join(TEMP_RECORDING_DIR, file);
      try {
        const stats = await fs.promises.stat(fullPath);
        if (maxAgeMs === 0 || now - stats.mtimeMs >= maxAgeMs) {
          await fs.promises.unlink(fullPath);
          purgedCount++;
        }
      } catch {
        // file may have already been removed concurrently
      }
    }
  } catch (err) {
    console.warn("[CareerOrbit Privacy] Stale purge error:", err);
  }

  return purgedCount;
}

export function getTempDirectoryPath(): string {
  return TEMP_RECORDING_DIR;
}

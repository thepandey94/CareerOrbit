import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import {
  generateEphemeralStorageKey,
  saveEphemeralRecording,
  deleteEphemeralRecording,
  purgeStaleRecordings,
} from "../src/lib/communication/privacy-storage";

describe("Communication Privacy Lifecycle & Ephemeral Video Deletion", () => {
  const activeKeys: string[] = [];

  afterEach(async () => {
    for (const key of activeKeys) {
      await deleteEphemeralRecording(key);
    }
  });

  it("should create temporary recording file and immediately purge it upon deletion", async () => {
    const key = generateEphemeralStorageKey();
    activeKeys.push(key);

    const dummyVideoContent = Buffer.from("DUMMY_VIDEO_STREAM_BYTES_FOR_TESTING");
    const { filePath, sizeBytes } = await saveEphemeralRecording(
      key,
      dummyVideoContent,
      "video/webm"
    );

    // 1. Verify file was saved to temporary directory
    expect(fs.existsSync(filePath)).toBe(true);
    expect(sizeBytes).toBe(dummyVideoContent.length);

    // 2. Execute ephemeral deletion lifecycle
    const deleteReceipt = await deleteEphemeralRecording(key);

    // 3. Verify file no longer exists on disk
    expect(fs.existsSync(filePath)).toBe(false);
    expect(deleteReceipt.deleted).toBe(true);
    expect(deleteReceipt.videoDeletedAt).toBeInstanceOf(Date);
  });

  it("should handle deleting non-existent or already purged files gracefully", async () => {
    const nonexistentKey = "rec_nonexistent_12345";
    const receipt = await deleteEphemeralRecording(nonexistentKey);

    expect(receipt.deleted).toBe(false);
    expect(receipt.videoDeletedAt).toBeInstanceOf(Date);
  });

  it("should purge stale temporary files older than threshold", async () => {
    const staleKey = generateEphemeralStorageKey();
    const dummyData = Buffer.from("STALE_DATA");
    const { filePath } = await saveEphemeralRecording(staleKey, dummyData);

    expect(fs.existsSync(filePath)).toBe(true);

    // Purge files older than 0 ms (all existing files)
    const purged = await purgeStaleRecordings(0);
    expect(purged).toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(filePath)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIMES = [
  "video/webm",
  "video/mp4",
  "video/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
];

function validateUploadMedia(fileSize: number, mimeType: string): { isValid: boolean; error?: string; status?: number } {
  if (fileSize > MAX_VIDEO_BYTES) {
    return {
      isValid: false,
      error: "Recording exceeds the 50MB maximum upload limit.",
      status: 413,
    };
  }

  const normalized = mimeType ? mimeType.toLowerCase().split(";")[0].trim() : "video/webm";
  if (!ALLOWED_MIMES.includes(normalized)) {
    return {
      isValid: false,
      error: "Unsupported media format. Only WebM, MP4, OGG, and WAV media streams are permitted.",
      status: 415,
    };
  }

  return { isValid: true };
}

describe("Security Hardening: Media Upload Validation & Payload Size Limits", () => {
  it("should permit legitimate video recording formats (WebM, MP4, OGG)", () => {
    expect(validateUploadMedia(10 * 1024 * 1024, "video/webm").isValid).toBe(true);
    expect(validateUploadMedia(15 * 1024 * 1024, "video/mp4").isValid).toBe(true);
    expect(validateUploadMedia(8 * 1024 * 1024, "video/ogg;codecs=vp8").isValid).toBe(true);
  });

  it("should permit valid audio-only presentation recordings", () => {
    expect(validateUploadMedia(4 * 1024 * 1024, "audio/webm").isValid).toBe(true);
    expect(validateUploadMedia(6 * 1024 * 1024, "audio/wav").isValid).toBe(true);
    expect(validateUploadMedia(5 * 1024 * 1024, "audio/mp4").isValid).toBe(true);
  });

  it("should reject malicious or executable mime types with HTTP 415", () => {
    const dangerousTypes = [
      "application/x-msdownload",
      "application/javascript",
      "text/html",
      "application/x-sh",
      "application/octet-stream",
      "image/svg+xml",
      "application/zip",
    ];

    for (const dangerous of dangerousTypes) {
      const result = validateUploadMedia(1024, dangerous);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(415);
      expect(result.error).toContain("Unsupported media format");
    }
  });

  it("should reject recordings exceeding the 50MB ceiling with HTTP 413 Payload Too Large", () => {
    const oversizedBytes = 50 * 1024 * 1024 + 1024; // 50MB + 1KB
    const result = validateUploadMedia(oversizedBytes, "video/webm");

    expect(result.isValid).toBe(false);
    expect(result.status).toBe(413);
    expect(result.error).toContain("exceeds the 50MB maximum upload limit");
  });
});

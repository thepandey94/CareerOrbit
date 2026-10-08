import { describe, it, expect } from "vitest";
import manifest from "../src/app/manifest";

describe("Production Readiness: PWA Web App Manifest & Installability Metadata", () => {
  it("should generate a valid W3C Web App Manifest configuration", () => {
    const config = manifest();

    expect(config.name).toBe("CareerOrbit — AI-Assisted Career Preparation");
    expect(config.short_name).toBe("CareerOrbit");
    expect(config.description).toBeTruthy();
    expect(config.start_url).toBe("/");
    expect(config.display).toBe("standalone");
    expect(config.background_color).toBe("#020617");
    expect(config.theme_color).toBe("#4f46e5");
  });

  it("should define accessible high-fidelity icons for home screen installation", () => {
    const config = manifest();

    expect(Array.isArray(config.icons)).toBe(true);
    expect(config.icons!.length).toBeGreaterThan(0);

    const mainIcon = config.icons![0];
    expect(mainIcon.src).toBe("/icon.svg");
    expect(mainIcon.type).toBe("image/svg+xml");
  });
});

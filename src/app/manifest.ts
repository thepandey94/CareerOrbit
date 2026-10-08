import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareerOrbit — AI-Assisted Career Preparation",
    short_name: "CareerOrbit",
    description:
      "Your journey. Your skills. Your career. AI-assisted career-preparation platform for students.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

import type { NextConfig } from "next";

// `standalone` emits a self-contained server for the Docker image — the
// difference between a ~200MB image and a ~1GB one.
//
// It is only wanted when self-hosting. Vercel builds and runs Next.js with its
// own output pipeline, and forcing standalone there is at best redundant, so
// the Dockerfile opts in explicitly and every other build leaves it alone.
const nextConfig: NextConfig = {
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;

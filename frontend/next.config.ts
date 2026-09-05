import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server and only the
  // node_modules actually reached at runtime — the difference between a
  // ~200MB image and a ~1GB one.
  output: "standalone",
};

export default nextConfig;

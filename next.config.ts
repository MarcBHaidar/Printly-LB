import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Pin the workspace root so a stray lockfile in a parent folder cannot make
// Turbopack infer the wrong project root.
const nextConfig: NextConfig = {
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;

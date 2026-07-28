import type { NextConfig } from "next";

function normalizeBasePath(basePath?: string) {
  if (!basePath || basePath === "/") return undefined;

  const normalized = `/${basePath.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? undefined : normalized;
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {})
};

export default nextConfig;

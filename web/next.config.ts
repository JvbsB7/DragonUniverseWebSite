import type { NextConfig } from "next";

// Subpasta de implantação (GitHub Pages: NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite). Vazio = build na raiz do domínio.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath, trailingSlash: true } : {}),
};

export default nextConfig;

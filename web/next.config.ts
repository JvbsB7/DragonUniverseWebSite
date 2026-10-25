import type { NextConfig } from "next";

// Subpasta de implantação (GitHub Pages: NEXT_PUBLIC_BASE_PATH=/DragonUniverseWebSite). Vazio = build na raiz do domínio.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

// Parâmetros de teste só em build de QA (NEXT_PUBLIC_DU_QA=1). O valor padrão "0" é fixado aqui para o bundler eliminar o código de QA.
const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_DU_QA: process.env.NEXT_PUBLIC_DU_QA === "1" ? "1" : "0" },
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath, trailingSlash: true } : {}),
};

export default nextConfig;

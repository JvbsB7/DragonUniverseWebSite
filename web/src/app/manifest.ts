import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { asset } from "@/lib/asset";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "pt-BR",
    start_url: asset("/"),
    display: "browser",
    background_color: "#060A16",
    theme_color: "#060A16",
    icons: [
      { src: asset("/img/logo/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: asset("/img/logo/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
  };
}

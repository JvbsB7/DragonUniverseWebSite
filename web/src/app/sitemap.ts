import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { urlPath } from "@/lib/seo";
import { loadWiki } from "@/lib/wiki";

export const dynamic = "force-static";

const routes = ["", "/sobre", "/wiki", "/novidades", "/roadmap", "/galeria", "/instalar", "/apoie", "/equipe", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  const { categories, pages } = loadWiki();
  const paths = [
    ...routes,
    ...categories.map((c) => `/wiki/${c.slug}`),
    ...pages.map((p) => `/wiki/${p.category}/${p.slug}`),
  ];
  return paths.map((p) => ({ url: `${siteConfig.url}${urlPath(p)}` }));
}

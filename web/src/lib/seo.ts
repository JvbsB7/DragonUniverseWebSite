import type { Metadata } from "next";

import { trailingSlash } from "@/lib/asset";

// Imagem social 1200×630 (entregas/v2-04-design/logo/README-logo.md §7). O metadataBase a transforma em URL absoluta.
export const defaultImage = "/img/og-dragon-universe-1200x630.png";

/** Caminho como a URL final: com "/" no fim quando a implantação usa pastas (trailingSlash). */
export const urlPath = (path: string) => (trailingSlash && path !== "/" && !path.endsWith("/") ? `${path}/` : path);

// Metadados de uma página: title, description, canonical, og:title, og:description, og:url e og:image.
// Os caminhos são relativos; o `metadataBase` do layout (siteConfig.url) os torna absolutos.
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  /** Título completo, já com a marca. Ex.: "O projeto | Dragon Universe". */
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: urlPath(path) },
    openGraph: {
      title,
      description,
      url: urlPath(path),
      siteName: "Dragon Universe",
      locale: "pt_BR",
      type: "website",
      images: [image ?? defaultImage],
    },
  };
}

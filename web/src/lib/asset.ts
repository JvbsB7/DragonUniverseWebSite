// Prefixo de implantação em subpasta (ex.: GitHub Pages em /DragonUniverseWebSite). Vazio = raiz do domínio.
// Definido em NEXT_PUBLIC_BASE_PATH no build (next.config.ts usa a mesma variável). O next/link e o next/navigation
// já cuidam do prefixo; tudo que NÃO passa por eles (img, srcset, fetch, texturas, ícones) deve usar asset().
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** `true` quando as rotas viram `pasta/index.html` (implantação em subpasta). */
export const trailingSlash = basePath !== "";

/** Prefixa um caminho absoluto do site (começa com "/") com o basePath. URLs completas e âncoras passam sem mudança. */
export function asset(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${basePath}${path}` : path;
}

/** Lista de `srcset` ("/a.webp 64w, /b.webp 96w") com o prefixo em cada URL. */
export function assetSet(srcSet: string): string {
  return srcSet
    .split(",")
    .map((item) => {
      const [url, ...rest] = item.trim().split(/\s+/);
      return [asset(url), ...rest].join(" ");
    })
    .join(", ");
}

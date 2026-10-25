import { getCategoryPages } from "@/lib/wiki";
import { quemUsa, resumo } from "@/lib/wiki-sections";
import { transformacoesOrdem } from "@/config/transformacoes";
import type { TransformacaoItem } from "@/components/showcase/transformacoes-showcase";
import type { WikiStatus } from "@/lib/wiki-types";

const mapa: Record<WikiStatus, TransformacaoItem["status"]> = { "no-jogo": "live", "em-desenvolvimento": "dev", planejado: "planned" };

// Itens da vitrine, lidos das páginas da wiki no build (título, status, "O que é" e "Quem usa" só quando a wiki afirma).
export function getTransformacoes(): TransformacaoItem[] {
  const paginas = getCategoryPages("transformacoes");
  return transformacoesOrdem.flatMap((slug) => {
    const p = paginas.find((x) => x.slug === slug);
    if (!p) throw new Error(`[transformacoes] página ausente na wiki: ${slug}`);
    return [{ slug, titulo: p.title, status: mapa[p.status], resumo: resumo(p), quemUsa: quemUsa(p), href: `/wiki/transformacoes/${slug}` }];
  });
}

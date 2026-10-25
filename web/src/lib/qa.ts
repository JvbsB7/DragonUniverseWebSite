// Parâmetros de teste (?batalha-quadro, ?du-sem-degradar, ?nuvem) só existem em builds de QA: `NEXT_PUBLIC_DU_QA=1 next build`.
// No build de produção a constante vale false em tempo de compilação e os ganchos de teste saem do pacote.
export const QA = process.env.NEXT_PUBLIC_DU_QA === "1";

/** Valor de um parâmetro de teste da URL (ou null). Sempre null fora do build de QA. */
export function parametroQA(nome: string): string | null {
  if (!QA || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(nome);
}
export const temParametroQA = (nome: string) => QA && typeof window !== "undefined" && new URLSearchParams(window.location.search).has(nome);

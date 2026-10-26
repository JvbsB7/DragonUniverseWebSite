// Parâmetros de teste (?batalha-quadro, ?du-sem-degradar, ?nuvem) só existem em builds de QA: `NEXT_PUBLIC_DU_QA=1 next build`.
// Quem chama repete a condição `process.env.NEXT_PUBLIC_DU_QA === "1"` no próprio ponto de uso: assim o bundler elimina a chamada
// (e o nome do parâmetro) do build de produção; uma constante importada de outro módulo não seria dobrada.
const QA = process.env.NEXT_PUBLIC_DU_QA === "1";

/** Valor de um parâmetro de teste da URL (ou null). Sempre null fora do build de QA. */
export function parametroQA(nome: string): string | null {
  if (!QA || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(nome);
}
export const temParametroQA = (nome: string) => QA && typeof window !== "undefined" && new URLSearchParams(window.location.search).has(nome);

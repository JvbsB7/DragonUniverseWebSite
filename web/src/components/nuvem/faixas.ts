// Registro das faixas reservadas da nuvem (v4-03 §8.2): cada <FaixaNuvem> informa se está visível e desde quando.
export type Faixa = { id: string; el: HTMLElement; visivelDesde: number | null };
export const faixas = new Map<string, Faixa>();
export const rolagem = { ultima: 0 };

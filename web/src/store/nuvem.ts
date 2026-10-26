import { create } from "zustand";

// Nuvem dourada (v4-03 §8; brief §6): aparição rara e decorativa. A contagem da visita fica em sessionStorage (com try/catch;
// memória como reserva) e é independente da coleção das esferas.
type NuvemStore = {
  /** Id da faixa em que a nuvem está cruzando agora (ou null). */
  ativa: string | null;
  /** Aviso para leitor de tela, só depois do aceno do visitante. */
  anuncio: string;
  iniciar: (id: string) => void;
  encerrar: () => void;
  anunciar: (texto: string) => void;
};

export const useNuvem = create<NuvemStore>((set) => ({
  ativa: null,
  anuncio: "",
  iniciar: (id) => set({ ativa: id, anuncio: "" }),
  encerrar: () => set({ ativa: null }),
  anunciar: (texto) => set({ anuncio: texto }),
}));

/** Interações intensas (viagem, seleção, coleta): a nuvem não começa e as que estão cruzando saem até esse instante. */
export const ocupacao = { ate: 0 };
export function ocuparNuvem(ms: number) {
  ocupacao.ate = Math.max(ocupacao.ate, Date.now() + ms);
}

const CHAVE = "du-nuvem";
type Contagem = { n: number; ultima: number; faixa: string; /** Faixas já usadas nesta visita: a nuvem não repete faixa (D45). */ usadas?: string[] };
let memoria: Contagem = { n: 0, ultima: 0, faixa: "" };

export function lerContagem(): Contagem {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (bruto) memoria = JSON.parse(bruto) as Contagem;
  } catch {
    /* usa a memória da visita */
  }
  return memoria;
}

export function gravarContagem(c: Contagem) {
  memoria = c;
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(c));
  } catch {
    /* só memória */
  }
}

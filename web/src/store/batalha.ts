import { create } from "zustand";

// Estado da batalha da Home (v4-03 §3.2, §4; v4.2: sem controles). A cena 3D é função pura do tempo: o relógio avança só na cena
// (quadro a quadro). A luta toca UMA vez por carregamento de página e fica no repouso (D49): não há pausa, pulo nem replay.
// `t` em segundos; DURACAO = fim da sequência; depois dela vem o repouso (idle).
export const DURACAO_BATALHA = 8;

export type StatusBatalha = "parado" | "tocando" | "repouso";

type BatalhaStore = {
  status: StatusBatalha;
  /** Já tocou nesta visita: o início automático acontece uma vez só. */
  jaTocou: boolean;
  /** Contador que muda a cada início ou salto ao fim, para a cena acertar o relógio mesmo se o estado já era "tocando". */
  rodada: number;
  iniciar: () => void;
  /** A sequência acabou (por conta própria ou porque o nível de qualidade caiu no meio): a cena vai ao quadro final do repouso. */
  terminou: () => void;
};

export const useBatalhaStore = create<BatalhaStore>((set, get) => ({
  status: "parado",
  jaTocou: false,
  rodada: 0,
  iniciar: () => {
    if (get().status !== "parado") return;
    set((s) => ({ status: "tocando", jaTocou: true, rodada: s.rodada + 1 }));
  },
  // `rodada` muda para a cena levar o relógio ao quadro final quando a sequência é encerrada antes dos 8 s.
  terminou: () => set((s) => ({ status: "repouso", rodada: s.rodada + (s.status === "tocando" && relogioBatalha.t < DURACAO_BATALHA ? 1 : 0) })),
}));

/** Relógio da cena (fora do React: lido a cada quadro). */
export const relogioBatalha = { t: 0, rodada: -1 };

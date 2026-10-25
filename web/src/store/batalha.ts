import { create } from "zustand";

// Estado da batalha da Home (v4-03 §3.2, §4). A cena 3D é função pura do tempo: o relógio avança só na cena (quadro a quadro) e
// os controles HTML mudam o estado aqui. `t` em segundos; DURACAO = fim da sequência; depois dela vem o repouso (idle).
export const DURACAO_BATALHA = 8;

export type StatusBatalha = "parado" | "tocando" | "repouso";

type Anuncio = "" | "Cena iniciada." | "Cena pausada." | "Cena retomada." | "Cena no repouso.";

type BatalhaStore = {
  status: StatusBatalha;
  pausada: boolean;
  /** Já tocou nesta visita (muda "Ver a batalha" para "Rever a batalha"). */
  jaTocou: boolean;
  /** Aviso para leitor de tela, só para ações do visitante (o início automático não é anunciado). */
  anuncio: Anuncio;
  /** Contador que muda a cada início, para a cena zerar o relógio mesmo se o estado já era "tocando". */
  rodada: number;
  iniciar: (porVisitante: boolean) => void;
  pausar: () => void;
  retomar: () => void;
  pular: () => void;
  /** A cena chegou ao fim por conta própria. */
  terminou: () => void;
};

export const useBatalhaStore = create<BatalhaStore>((set, get) => ({
  status: "parado",
  pausada: false,
  jaTocou: false,
  anuncio: "",
  rodada: 0,
  iniciar: (porVisitante) => {
    // Nunca acumula pedidos: só inicia parado ou em repouso.
    if (get().status === "tocando") return;
    set((s) => ({ status: "tocando", pausada: false, jaTocou: true, rodada: s.rodada + 1, anuncio: porVisitante ? "Cena iniciada." : "" }));
  },
  pausar: () => set({ pausada: true, anuncio: "Cena pausada." }),
  retomar: () => set({ pausada: false, anuncio: "Cena retomada." }),
  pular: () => {
    if (get().status !== "tocando") return;
    set({ status: "repouso", pausada: false, jaTocou: true, anuncio: "Cena no repouso." });
  },
  terminou: () => set({ status: "repouso", anuncio: "" }),
}));

/** Relógio da cena (fora do React: lido a cada quadro). */
export const relogioBatalha = { t: 0, rodada: -1 };

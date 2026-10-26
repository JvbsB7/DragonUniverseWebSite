import { create } from "zustand";

// Canvas "cinema" compartilhado (v4, v4-01 §3.1): um único contexto WebGL desenha todas as vistas 3D da página.
// `visiveis` guarda as vistas (CinemaView) que estão na tela; `falhou` marca perda de contexto ou falta de WebGL.
type CinemaStore = {
  visiveis: string[];
  falhou: boolean;
  mostrar: (id: string) => void;
  ocultar: (id: string) => void;
  falhar: () => void;
};

export const useCinemaStore = create<CinemaStore>((set) => ({
  visiveis: [],
  falhou: false,
  mostrar: (id) => set((s) => (s.visiveis.includes(id) ? s : { visiveis: [...s.visiveis, id] })),
  ocultar: (id) => set((s) => (s.visiveis.includes(id) ? { visiveis: s.visiveis.filter((v) => v !== id) } : s)),
  falhar: () => set({ falhou: true }),
}));

/** Identificador da vaga do canvas cinema no gerenciador global (máximo de 2 canvases por página). */
export const VAGA_CINEMA = "cinema";

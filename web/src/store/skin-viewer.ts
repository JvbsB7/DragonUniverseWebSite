import { create } from "zustand";

export type SkinAnimation = "idle" | "walk" | "run" | "fly" | "wave";

// Máximo de canvas WebGL vivos no site inteiro (brief §8).
export const MAX_LIVE_CANVAS = 2;

type SkinViewerStore = {
  // Cenas com canvas, da mais antiga à mais recente. Um pedido novo tira a mais antiga.
  live: string[];
  // O 3D decorativo só começa depois da primeira interação (rolar, tocar, mover o mouse ou usar o teclado).
  interacted: boolean;
  request: (id: string) => void;
  release: (id: string) => void;
};

export const useSkinViewerStore = create<SkinViewerStore>((set) => ({
  live: [],
  interacted: false,
  request: (id) =>
    set((s) => {
      if (s.live.at(-1) === id) return s;
      return { live: [...s.live.filter((v) => v !== id), id].slice(-MAX_LIVE_CANVAS) };
    }),
  release: (id) =>
    set((s) => (s.live.includes(id) ? { live: s.live.filter((v) => v !== id) } : s)),
}));

const interactionEvents = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
let armed = false;

// Espera a primeira interação sem custo: um único conjunto de ouvintes passivos para o site todo.
export function armFirstInteraction() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const done = () => {
    interactionEvents.forEach((e) => window.removeEventListener(e, done));
    useSkinViewerStore.setState({ interacted: true });
  };
  interactionEvents.forEach((e) => window.addEventListener(e, done, { passive: true }));
}

// Apresentações decorativas já feitas nesta visita (movimento.md §8.4). Vive na memória do módulo: sair da tela e voltar
// não repete o gesto, e nada é gravado no navegador.
export const apresentadas = new Set<string>();
// Tempo máximo de uma apresentação, em ms: 3 s para um apresentador e 4 s para a cena da equipe (movimento.md §6.2).
export const DURACAO_APRESENTADOR = 3000;
export const DURACAO_CENA = 4000;

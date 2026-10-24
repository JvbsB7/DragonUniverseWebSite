import { create } from "zustand";

// Menu completo (Sheet). Acionado pelo botão do cabeçalho e pelo "Mais" da hotbar; o foco volta a quem abriu (§7.4).
type MenuState = {
  /** O Sheet (Base UI) só é baixado depois que alguém toca, foca ou abre o menu. */
  armed: boolean;
  open: boolean;
  arm: () => void;
  openFrom: (trigger: HTMLElement) => void;
  setOpen: (open: boolean) => void;
};

/** Último acionador, usado como destino do foco ao fechar. Fica fora do estado para não renderizar de novo. */
export const menuReturnFocus: { current: HTMLElement | null } = { current: null };

export const useMenu = create<MenuState>((set) => ({
  armed: false,
  open: false,
  arm: () => set({ armed: true }),
  openFrom: (trigger) => {
    menuReturnFocus.current = trigger;
    set({ armed: true, open: true });
  },
  setOpen: (open) => set({ open }),
}));

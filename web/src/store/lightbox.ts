import { create } from "zustand";

// Estado compartilhado de UI da galeria. O conteúdo vem de `config/galeria.ts`, não daqui.
type LightboxState = {
  index: number | null;
  open: (index: number) => void;
  close: () => void;
};

export const useLightbox = create<LightboxState>((set) => ({
  index: null,
  open: (index) => set({ index }),
  close: () => set({ index: null }),
}));

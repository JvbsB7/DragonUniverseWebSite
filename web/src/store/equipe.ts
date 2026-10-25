import { create } from "zustand";
import type { IdDaPessoa } from "@/config/equipe";

// Pessoa selecionada na vitrine da equipe (v4-03 §7). Compartilhada entre a cena (desktop) e os cartões (celular).
type EquipeStore = {
  selecionada: IdDaPessoa | null;
  /** Aviso para leitor de tela (aria-live): só a mudança de perfil. */
  anuncio: string;
  selecionar: (id: IdDaPessoa, nome: string) => void;
  fechar: () => void;
};

export const useEquipeStore = create<EquipeStore>((set) => ({
  selecionada: null,
  anuncio: "",
  selecionar: (id, nome) => set({ selecionada: id, anuncio: `Mostrando o perfil de ${nome}.` }),
  fechar: () => set({ selecionada: null, anuncio: "Perfil fechado. Mostrando a equipe toda." }),
}));

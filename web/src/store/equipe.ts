import { create } from "zustand";
import type { IdDaPessoa } from "@/config/equipe";
import type { IdDoCombatente } from "@/config/ataques";
import { ocuparNuvem } from "@/store/nuvem";

// Pessoa selecionada na vitrine da equipe (v4-03 §7). Compartilhada entre a cena (desktop) e os cartões (celular).
type EquipeStore = {
  selecionada: IdDaPessoa | null;
  /** Aviso para leitor de tela (aria-live): só a mudança de perfil. */
  anuncio: string;
  /** Ataque de ki em andamento na vitrine (D42): a cena 3D toca o clipe e o raio; `chave` muda a cada disparo. */
  ataque: { id: IdDoCombatente; chave: number } | null;
  disparar: (id: IdDoCombatente) => void;
  selecionar: (id: IdDaPessoa, nome: string) => void;
  fechar: () => void;
};

// Contador próprio: a chave nunca se repete, mesmo depois de a seleção zerar o ataque.
let chaveDoAtaque = 0;

export const useEquipeStore = create<EquipeStore>((set) => ({
  selecionada: null,
  anuncio: "",
  ataque: null,
  disparar: (id) => set({ ataque: { id, chave: ++chaveDoAtaque } }),
  selecionar: (id, nome) => {
    ocuparNuvem(2500);
    set({ selecionada: id, ataque: null, anuncio: `Mostrando o perfil de ${nome}.` });
  },
  fechar: () => {
    ocuparNuvem(2500);
    set({ selecionada: null, ataque: null, anuncio: "Perfil fechado. Mostrando a equipe toda." });
  },
}));

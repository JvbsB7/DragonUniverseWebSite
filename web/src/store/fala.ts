import { create } from "zustand";
import type { Cauda } from "@/config/falas";

// Balão de fala (D29/D34): um por vez no site. A fala por ação do visitante (seleção, "Ler a fala") tem prioridade sobre a automática
// (repouso da batalha, dragão): a automática nunca troca uma fala de ação e nenhuma fila atrasa frases.
export type ContextoDeFala = "vitrine" | "repouso" | "dragao" | "nuvem";
export type Fala = { contexto: ContextoDeFala; locutor: string; texto: string; cauda: Cauda; acao: boolean; semLimite: boolean; chave: number;
  /** Balão ao lado de um sprite dentro de uma faixa (aceno da nuvem): `lado` é onde fica o balão e `pos` a distância (px) da borda da faixa. */
  lateral?: { lado: "esquerda" | "direita"; pos: number };
  /** Faixa da nuvem onde a fala aparece (só o aceno). */
  faixa?: string };
type Entrada = Omit<Fala, "chave" | "semLimite"> & { semLimite?: boolean };

type FalaStore = {
  atual: Fala | null;
  ultima: Partial<Record<ContextoDeFala, Fala>>;
  falar: (f: Entrada) => void;
  fechar: (contexto?: ContextoDeFala) => void;
};

let chave = 0;
export const useFalaStore = create<FalaStore>((set, get) => ({
  atual: null,
  ultima: {},
  falar: (f) => {
    const atual = get().atual;
    if (!f.acao && atual?.acao) return;
    const fala = { ...f, semLimite: f.semLimite ?? false, chave: ++chave };
    set((s) => ({ atual: fala, ultima: { ...s.ultima, [f.contexto]: fala } }));
  },
  fechar: (contexto) => {
    if (contexto && get().atual?.contexto !== contexto) return;
    set({ atual: null });
  },
}));

/** Quantas vezes cada pessoa já foi selecionada (para alternar o grito do golpe e a frase). */
export const selecoes: Record<string, number> = {};

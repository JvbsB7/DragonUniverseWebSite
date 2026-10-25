import { create } from "zustand";

// Esferas de energia (v4-03 §9; copy v4-04 §4): enfeite do site, sem relação com apoio nem com o jogo. D6: a coleção fica no
// localStorage deste navegador (leitura e escrita em try/catch); sem armazenamento, vale só nesta visita.
export const ESFERAS = ["origem", "racas", "formas", "destinos", "construcao", "pessoas", "comunidade"] as const;
export type IdEsfera = (typeof ESFERAS)[number];
const CHAVE = "du-esferas";

type EsferasStore = {
  coletadas: IdEsfera[];
  /** O localStorage funciona? Se não, "Seu progresso vale só nesta visita." */
  persistente: boolean;
  carregado: boolean;
  /** Mensagem para leitor de tela (aria-live). */
  anuncio: string;
  /** Contador que muda a cada 7ª coleta ao vivo, para tocar o fechamento uma vez (restaurar 7/7 não repete). */
  fechamento: number;
  /** Última esfera coletada ao vivo (para a confirmação curta no nicho da 7ª). */
  ultima: IdEsfera | null;
  carregar: () => void;
  coletar: (id: IdEsfera) => void;
  reiniciar: () => void;
};

function ler(): { lista: IdEsfera[]; ok: boolean } {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const lista = bruto ? (JSON.parse(bruto) as string[]).filter((x): x is IdEsfera => (ESFERAS as readonly string[]).includes(x)) : [];
    return { lista, ok: true };
  } catch {
    return { lista: [], ok: false };
  }
}

function gravar(lista: IdEsfera[]): boolean {
  try {
    if (lista.length) window.localStorage.setItem(CHAVE, JSON.stringify(lista));
    else window.localStorage.removeItem(CHAVE);
    return true;
  } catch {
    return false;
  }
}

export const useEsferasStore = create<EsferasStore>((set, get) => ({
  coletadas: [],
  persistente: true,
  carregado: false,
  anuncio: "",
  fechamento: 0,
  ultima: null,
  carregar: () => {
    if (get().carregado) return;
    const { lista, ok } = ler();
    set({ coletadas: lista, persistente: ok, carregado: true });
  },
  coletar: (id) => {
    const { coletadas } = get();
    if (coletadas.includes(id)) {
      set({ anuncio: "Você já achou esta esfera." });
      return;
    }
    const lista = [...coletadas, id];
    const ok = gravar(lista);
    const completou = lista.length === ESFERAS.length;
    set({
      coletadas: lista,
      persistente: get().persistente && ok,
      anuncio: completou ? "Você achou as 7 esferas!" : `Você achou ${lista.length} de 7 esferas.`,
      fechamento: completou ? get().fechamento + 1 : get().fechamento,
      ultima: id,
    });
  },
  reiniciar: () => {
    const ok = gravar([]);
    set({ coletadas: [], persistente: get().persistente && ok, anuncio: "Esferas escondidas de novo. Você achou 0 de 7." });
  },
}));

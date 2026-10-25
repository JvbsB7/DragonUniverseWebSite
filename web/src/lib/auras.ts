// Auras da equipe (D31): os valores moram nos tokens `--du-aura-*` de globals.css; aqui só se leem (a cena 3D precisa de cores
// em JS) e há um valor de reserva idêntico para o servidor e para o primeiro quadro.
export type IdDaAura = "jvbsbr" | "rvmm255" | "luan";
export type Aura = {
  base: string;
  brilho: string;
  /** Cor dos sprites aditivos e dos halos: o azul escuro do rvmm255 some no fundo escuro, então ele usa o brilho. */
  halo: string;
};

const RESERVA: Record<IdDaAura, { base: string; brilho: string }> = {
  jvbsbr: { base: "#9652C9", brilho: "#D5A2FF" },
  rvmm255: { base: "#123C82", brilho: "#4C9DFF" },
  luan: { base: "#D6C347", brilho: "#FFF2A6" },
};

const cache: Partial<Record<IdDaAura, Aura>> = {};

export function aura(id: IdDaAura): Aura {
  const guardada = cache[id];
  if (guardada) return guardada;
  let { base, brilho } = RESERVA[id];
  if (typeof document !== "undefined") {
    const css = getComputedStyle(document.documentElement);
    base = css.getPropertyValue(`--du-aura-${id}`).trim() || base;
    brilho = css.getPropertyValue(`--du-aura-${id}-brilho`).trim() || brilho;
  }
  const lida = { base, brilho, halo: id === "rvmm255" ? brilho : base };
  if (typeof document !== "undefined") cache[id] = lida;
  return lida;
}

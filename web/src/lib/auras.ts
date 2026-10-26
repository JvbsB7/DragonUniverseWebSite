// Auras da equipe (D31): os valores moram nos tokens `--du-aura-*` de globals.css; aqui só se leem (a cena 3D precisa de cores
// em JS) e há um valor de reserva idêntico para o servidor e para o primeiro quadro.
export type IdDaAura = "jvbsbr" | "rvmm255" | "luan";
export type Aura = {
  base: string;
  brilho: string;
  /** Núcleo claro do raio de ki (D42): o brilho clareado; só JvbsBR e rvmm255 têm. */
  nucleo: string;
  /** Cor dos sprites aditivos e dos halos: o azul escuro do rvmm255 some no fundo escuro, então ele usa o brilho. */
  halo: string;
};

const RESERVA: Record<IdDaAura, { base: string; brilho: string; nucleo: string }> = {
  jvbsbr: { base: "#9652C9", brilho: "#D5A2FF", nucleo: "#E4C3FF" },
  rvmm255: { base: "#123C82", brilho: "#4C9DFF", nucleo: "#AED3FF" },
  luan: { base: "#D6C347", brilho: "#FFF2A6", nucleo: "#FFF8D1" },
};

const cache: Partial<Record<IdDaAura, Aura>> = {};

export function aura(id: IdDaAura): Aura {
  const guardada = cache[id];
  if (guardada) return guardada;
  let { base, brilho, nucleo } = RESERVA[id];
  if (typeof document !== "undefined") {
    const css = getComputedStyle(document.documentElement);
    base = css.getPropertyValue(`--du-aura-${id}`).trim() || base;
    brilho = css.getPropertyValue(`--du-aura-${id}-brilho`).trim() || brilho;
    nucleo = css.getPropertyValue(`--du-aura-${id}-nucleo`).trim() || nucleo;
  }
  const lida = { base, brilho, nucleo, halo: id === "rvmm255" ? brilho : base };
  if (typeof document !== "undefined") cache[id] = lida;
  return lida;
}

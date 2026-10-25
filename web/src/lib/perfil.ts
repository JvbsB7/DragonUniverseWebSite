// Perfil leve (v3-04-design.md §11.4 e decisão M7 do Coordinator): sem WebGL e com partículas reduzidas quando houver
// movimento reduzido, economia de dados, pouca capacidade (≤ 4 núcleos ou ≤ 4 GB, quando o navegador informa) ou tela < 768 px.
// Sem informação confiável a favor do 3D, o hero fica no 2.5D estático. Só roda no navegador.
type NavigatorExtra = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export function perfilLeve(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as NavigatorExtra;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (nav.connection?.saveData) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (window.matchMedia("(max-width: 47.99rem)").matches) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return false;
}

/** Marca <html data-perfil="leve"> para o CSS desligar blur e efeitos. Não alterna entre perfis na mesma visita. */
export function aplicarPerfil() {
  const root = document.documentElement;
  if (root.dataset.perfil) return;
  root.dataset.perfil = perfilLeve() ? "leve" : "completo";
}

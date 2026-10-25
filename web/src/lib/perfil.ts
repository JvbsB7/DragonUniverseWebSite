// Níveis de qualidade da experiência (v4, estendendo o perfil leve/completo da v3: decisão M7 e v3-04-design.md §11.4):
//   estatico: movimento reduzido (sistema ou botão "Reduzir animações") ou economia de dados. Sem WebGL, sem movimento.
//   baixo:    pouca capacidade (≤ 4 núcleos ou ≤ 4 GB, quando o navegador informa), tela < 768 px ou ponteiro grosso. Sem WebGL.
//   medio:    desktop com 5 a 8 núcleos ou menos de 8 GB. 3D com DPR 1 e menos partículas.
//   alto:     desktop com folga. 3D completo.
// `perfilLeve()` (estatico e baixo) continua valendo como na v3. Se os quadros ficarem lentos, `degradar()` desce um nível
// na mesma visita (até "baixo"). Só roda no navegador; no servidor vale "estatico".
import { temParametroQA } from "@/lib/qa";

type NavigatorExtra = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export type Qualidade = "estatico" | "baixo" | "medio" | "alto";
const ORDEM: Qualidade[] = ["estatico", "baixo", "medio", "alto"];
const CHAVE_REDUZIR = "du-reduzir-animacoes";

const ouvintes = new Set<() => void>();
let reduzirUsuario: boolean | undefined;
let degradacao = 0;

const avisar = () => ouvintes.forEach((f) => f());

/** Assinatura para `useSyncExternalStore`: muda quando o botão ou a degradação alteram o nível. */
export function assinarQualidade(cb: () => void) {
  ouvintes.add(cb);
  return () => void ouvintes.delete(cb);
}

/** O sistema pede menos movimento (prefers-reduced-motion). */
export function sistemaPedeMenos(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Escolha do botão "Reduzir animações" (salva neste aparelho; sem armazenamento, vale só nesta visita). */
export function reduzirAtivo(): boolean {
  if (typeof window === "undefined") return false;
  if (reduzirUsuario === undefined) {
    try {
      reduzirUsuario = window.localStorage.getItem(CHAVE_REDUZIR) === "1";
    } catch {
      reduzirUsuario = false;
    }
  }
  return reduzirUsuario;
}

export function definirReduzir(valor: boolean) {
  reduzirUsuario = valor;
  try {
    if (valor) window.localStorage.setItem(CHAVE_REDUZIR, "1");
    else window.localStorage.removeItem(CHAVE_REDUZIR);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  aplicarAtributos();
  avisar();
}

/** Desce um nível de qualidade nesta visita (quadros lentos). Não passa de "baixo". */
export function degradar() {
  // Teste/QA: `?du-sem-degradar` (só em build de QA) mantém o nível (render por software é lento por natureza).
  if (process.env.NEXT_PUBLIC_DU_QA === "1" && temParametroQA("du-sem-degradar")) return;
  if (degradacao >= 2 || ORDEM.indexOf(qualidadeAtual()) <= 1) return;
  degradacao += 1;
  aplicarAtributos();
  avisar();
}

function qualidadeBase(): Qualidade {
  if (typeof window === "undefined") return "estatico";
  const nav = navigator as NavigatorExtra;
  if (reduzirAtivo() || sistemaPedeMenos() || nav.connection?.saveData) return "estatico";
  const nucleos = nav.hardwareConcurrency;
  if (typeof nucleos === "number" && nucleos <= 4) return "baixo";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return "baixo";
  if (window.matchMedia("(max-width: 47.99rem)").matches) return "baixo";
  if (window.matchMedia("(pointer: coarse)").matches) return "baixo";
  if ((typeof nucleos === "number" && nucleos <= 8) || (typeof nav.deviceMemory === "number" && nav.deviceMemory < 8)) return "medio";
  return "alto";
}

export function qualidadeAtual(): Qualidade {
  const base = qualidadeBase();
  const i = ORDEM.indexOf(base);
  return i <= 1 ? base : ORDEM[Math.max(1, i - degradacao)];
}

export function perfilLeve(): boolean {
  const q = qualidadeAtual();
  return q === "estatico" || q === "baixo";
}

/** Marca <html data-perfil="leve|completo" data-qualidade data-reduzir> para o CSS desligar blur e movimento. */
export function aplicarAtributos() {
  const root = document.documentElement;
  const q = qualidadeAtual();
  root.dataset.perfil = q === "estatico" || q === "baixo" ? "leve" : "completo";
  root.dataset.qualidade = q;
  if (reduzirAtivo()) root.dataset.reduzir = "true";
  else delete root.dataset.reduzir;
}

/** Primeira marcação, na montagem do cabeçalho. Não faz nada se já foi marcado. */
export function aplicarPerfil() {
  if (document.documentElement.dataset.qualidade) return;
  aplicarAtributos();
}

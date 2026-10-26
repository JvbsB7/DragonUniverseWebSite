// Linha do tempo da batalha (v4-03 §4): tudo é função pura do tempo `t` (s), então pausar, pular, rever e quadro de teste
// (`?batalha-quadro=4.5`) são só questão de qual `t` desenhar. Unidades: 1 = 1 px de skin; personagem com ~32 de altura.
import { aura as auraDe } from "@/lib/auras";
import { CLIPES, amostrar, misturar, type Clipe, type Pose } from "@/lib/personagens";

export const suave = (k: number) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};
export const saida = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 2;

/** Interpola entre pontos [t, valor] com suavização; antes/depois do intervalo, segura o valor da ponta. */
export function curva(t: number, pts: readonly (readonly [number, number])[]): number {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1];
      const [t1, v1] = pts[i];
      return v0 + (v1 - v0) * suave((t - t0) / (t1 - t0));
    }
  }
  return pts[pts.length - 1][1];
}

type Trecho = { a: number; clipe: Clipe };
const FUSAO = 0.15;

function poseDe(trechos: Trecho[], t: number): Pose {
  let i = 0;
  while (i < trechos.length - 1 && t >= trechos[i + 1].a) i++;
  const atual = amostrar(trechos[i].clipe, t - trechos[i].a);
  const dentro = t - trechos[i].a;
  if (i > 0 && dentro < FUSAO) return misturar(amostrar(trechos[i - 1].clipe, t - trechos[i - 1].a), atual, suave(dentro / FUSAO));
  return atual;
}

const J = CLIPES.jvbsbr;
const R = CLIPES.rvmm255;
// D41 (v4-1-spec-luta-ki §2.1): antecipação 1,00–1,30, investida 1,30–1,80 e três golpes no ar (1,80 / 2,15 / 2,40) antes do choque final
// (2,65–2,77). O início de cada clipe é o instante do evento menos o tempo do evento no clipe (golpeAereo impacta em 0,20; esquivaAerea
// desvia em 0,16; bloqueioAereo impacta em 0,14). Os clipes aéreos já trazem a compensação do pescoço (D40): é a única, sem somar outra.
const trechosJoao: Trecho[] = [
  { a: 0, clipe: J.investida },
  { a: 0.45, clipe: J.guarda },
  { a: 1.3, clipe: J.investida },
  { a: 1.6, clipe: J.golpeAereo }, // golpe 1: JvbsBR acerta (1,80)
  { a: 2.01, clipe: J.bloqueioAereo }, // golpe 2: bloqueia o rvmm255 (2,15)
  { a: 2.24, clipe: J.esquivaAerea }, // golpe 3: esquiva (2,40)
  { a: 2.45, clipe: J.golpeAereo }, // choque final (2,65)
  { a: 3.02, clipe: J.voo },
  { a: 3.3, clipe: J.guarda },
  { a: 6.0, clipe: J.idle },
];
const trechosRicardo: Trecho[] = [
  { a: 0, clipe: R.investida },
  { a: 0.45, clipe: R.guarda },
  { a: 1.3, clipe: R.investida },
  { a: 1.65, clipe: R.esquivaAerea }, // golpe 1: esquiva (1,81)
  { a: 1.95, clipe: R.golpeAereo }, // golpe 2: acerta (2,15)
  { a: 2.2, clipe: R.golpeAereo }, // golpe 3: passa direto (2,40)
  { a: 2.47, clipe: R.golpeAereo }, // choque final (2,67)
  { a: 3.04, clipe: R.voo },
  { a: 3.3, clipe: R.guarda },
  { a: 6.0, clipe: R.idle },
];

export const poseJoao = (t: number) => poseDe(trechosJoao, t);
export const poseRicardo = (t: number) => poseDe(trechosRicardo, t);
export const poseLuan = (t: number) => amostrar(CLIPES.luan.flutuar, t);

// Posição (x, y) e giro (rad; + olha para +x) de cada combatente. Esquerda/direita são do visitante (v4-03 §4).
export const joaoX = (t: number) => curva(t, [[0, -86], [0.45, -50], [1.0, -50], [1.25, -53], [1.8, -34], [2.15, -30], [2.4, -28], [2.65, -26], [2.77, -26], [3.5, -41], [4.0, -39], [4.8, -31], [6.0, -26]]);
export const ricardoX = (t: number) => -curva(t, [[0, -86], [0.45, -50], [1.0, -50], [1.25, -53], [1.8, -34], [2.15, -30], [2.4, -29], [2.67, -26], [2.77, -26], [3.5, -41], [4.0, -39], [4.8, -31], [6.0, -26]]);
export const combatenteY = (t: number) => curva(t, [[0, 2], [0.45, 2], [0.8, 0], [1.0, 0], [1.25, -2], [1.7, 3], [2.1, 4], [2.8, 4], [3.3, 6], [4.2, 0]]);
export const combatenteGiro = (t: number) => curva(t, [[0, 1.45], [0.45, 1.45], [0.85, 0.9], [1.2, 0.9], [1.5, 1.3], [2.77, 1.3], [3.1, 1.65], [3.5, 1.3], [4.0, 1.15], [4.8, 0.9]]);
export const luanY = (t: number) => curva(t, [[0, 80], [6.0, 80], [6.55, 30], [7.45, 32], [8, 32]]);
export const luanVisivel = (t: number) => t >= 5.9;

// Câmera (D33): plano geral, aproximação de até 3% antes do contato, lateral em leve 3/4 e baixa (olhando ~5° para cima) no choque,
// volta ao plano de 4 s, órbita curta de 5°, recuo e inclinação para cima na revelação do Luan. FOV fixo em 45°: sem zoom de impacto.
export function camera(t: number, comTremor = true) {
  const z = curva(t, [[0, 80], [0.6, 80], [2.65, 78], [3.2, 78], [4.4, 80], [6.0, 90], [7.45, 96], [8, 96]]);
  const baixa = curva(t, [[1.3, 0], [2.0, 1], [3.2, 1], [4.4, 0]]);
  const y = curva(t, [[0, 6], [6.0, 6], [6.4, 13], [7.45, 17], [8, 17]]) - 9 * baixa;
  const olhaY = curva(t, [[0, 2], [6.0, 2], [6.4, 13], [7.45, 17], [8, 17]]) + 1.5 * baixa;
  const az = ((curva(t, [[0, 0], [1.3, 0], [2.0, 12], [3.2, 12], [4.4, 0], [4.8, 5], [6.0, 5], [7.45, 2], [8, 2]])) * Math.PI) / 180;
  const fov = 45;
  // Único tremor amortecido: no choque final (2,67–2,92 s), até ~0,2 unidade (≈1,5 px na referência de 1152 px).
  const k = t > 2.67 && t < 2.92 ? 1 - (t - 2.67) / 0.25 : 0;
  const tremor = comTremor ? k * 0.2 : 0;
  return {
    pos: [Math.sin(az) * z + Math.sin(t * 90) * tremor, y + Math.cos(t * 77) * tremor, Math.cos(az) * z] as const,
    olha: [0, olhaY, 0] as const,
    fov,
  };
}

// Intensidade da aura: contorno nasce em 0,45–1,20 s, cresce na investida e no choque e volta ao repouso (0,16–0,22).
export function aura(t: number, ator: 0 | 1): number {
  const repouso = 0.26 + 0.04 * Math.sin(t * 1.15 + ator * 1.7);
  if (t >= 8) return repouso;
  const boost = curva(t, [[0, 0.3], [0.45, 0.24], [1.0, 0.2], [1.3, 0.5], [1.8, 0.4], [2.65, 0.45], [3.5, 0.3], [4.4, 0.24], [6.0, 0.19], [8, 0.19]]);
  return boost + (repouso - 0.19) * suave((t - 6) / 2);
}

// Efeitos pontuais.
// Realce ciano ligado ao ponto médio entre os punhos (x = 0; y acompanha o voo dos combatentes), com ~6–8% da largura do quadro.
export const nucleoDeImpacto = (t: number) => (t < 2.63 || t > 3.3 ? 0 : t < 2.67 ? suave((t - 2.63) / 0.04) : t < 2.77 ? 1 : 1 - suave((t - 2.77) / 0.5));
/** Realce pequeno (≤ 4% da largura) no bloqueio do JvbsBR, em 2,15 s. */
export const realceDoBloqueio = (t: number) => (t < 2.11 || t > 2.4 ? 0 : t < 2.15 ? suave((t - 2.11) / 0.04) : 1 - suave((t - 2.15) / 0.25));
export const PUNHOS_DY = -1; // altura dos punhos em relação ao centro do corpo no contato (ajustada no quadro de 2,1 s)
// Um anel pelo chão (v4-03 §4): nasce no choque (2,6 s), alcança as rochas entre 4,0 e 4,8 s e se dissipa até ~5,8 s.
export const anel = (t: number, atraso: number) => {
  const p = (t - 2.77 - atraso) / 3.2;
  return p < 0 || p > 1 ? null : { raio: 4 + 52 * saida(p), opacidade: 0.32 * (1 - p) ** 1.3 };
};
export const linhasDeVelocidade = (t: number) => (t < 0.5 ? 0.3 + t : t >= 1.35 && t <= 1.75 ? (t - 1.35) / 0.4 : null);

// Partículas determinísticas: posição em função do tempo (sem estado), para poder pausar e pular.
export type Particula = { tipo: "impacto" | "fragmento" | "energia" | "ambiente"; nasce: number; vida: number; p0: [number, number, number]; v: [number, number, number]; escala: number; cor: string };
function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const CORES = { ciano: "#23D7FF", rocha: "#1a3160", rochaClara: "#4a72c4" };
export function criarParticulas(): Particula[] {
  const r = prng(7);
  const lista: Particula[] = [];
  const coresImpacto = [CORES.ciano, auraDe("jvbsbr").brilho, auraDe("rvmm255").brilho, CORES.ciano];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * 0.4;
    const vel = 14 + r() * 12;
    lista.push({ tipo: "impacto", nasce: 2.65, vida: 0.8, p0: [0, 2, 4], v: [Math.cos(a) * vel, Math.sin(a) * vel * 0.8 + 4, (r() - 0.5) * 8], escala: 1.1, cor: coresImpacto[i % 4] });
  }
  for (let i = 0; i < 6; i++) {
    const lado = i % 2 ? 1 : -1;
    lista.push({ tipo: "fragmento", nasce: 4.4 + i * 0.12, vida: 1.7, p0: [lado * (38 + r() * 14), -15, -14 + r() * 8], v: [lado * (3 + r() * 4), 14 + r() * 7, -3 - r() * 3], escala: 2.0, cor: CORES.rochaClara });
  }
  // Energia que se dissipa depois da onda (4,8–6,8 s): poucas faíscas lentas subindo.
  for (let i = 0; i < 4; i++) {
    lista.push({ tipo: "energia", nasce: 4.4 + i * 0.25, vida: 1.8, p0: [(i - 1.5) * 10, -2, 4], v: [(r() - 0.5) * 4, 5 + r() * 3, (r() - 0.5) * 3], escala: 0.9, cor: i % 2 ? auraDe("jvbsbr").brilho : auraDe("rvmm255").brilho });
  }
  for (let i = 0; i < 8; i++) {
    lista.push({ tipo: "ambiente", nasce: 0, vida: 1e9, p0: [-70 + r() * 140, -4 + r() * 40, -20 + r() * 20], v: [0, 0, 0], escala: 0.55, cor: CORES.ciano });
  }
  return lista;
}
export const GRAVIDADE = 30;

// Imagens residuais (D41, spec §2.3): duas cópias por lutador, atrasadas 60 e 120 ms, a 22% e 10% de opacidade (cor da aura), que duram
// no máximo 0,18 s e só aparecem depois de investida, golpe ou impacto, com pelo menos 0,25 s entre dois eventos do mesmo lutador.
export const EVENTOS_RESIDUAIS: Record<"joao" | "ricardo", readonly number[]> = { joao: [1.4, 1.8, 2.65], ricardo: [1.4, 2.15, 2.4, 2.67] };
export const ATRASOS_RESIDUAIS = [0.06, 0.12] as const;
export const OPACIDADES_RESIDUAIS = [0.22, 0.1] as const;
/** 1 no evento e 0 depois de 0,18 s; 0 fora das janelas. */
export function residual(t: number, quem: "joao" | "ricardo"): number {
  for (const e of EVENTOS_RESIDUAIS[quem]) if (t >= e && t - e <= 0.18) return 1 - (t - e) / 0.18;
  return 0;
}

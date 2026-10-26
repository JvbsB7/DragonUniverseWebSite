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
// O impacto do soco cai em 2,00 s: JvbsBR (impacto em 0,36 s) começa em 1,64; rvmm255 (0,32 s) em 1,68.
const trechosJoao: Trecho[] = [
  { a: 0, clipe: J.investida },
  { a: 0.45, clipe: J.guarda },
  { a: 1.2, clipe: J.investida },
  { a: 1.64, clipe: J.soco },
  { a: 2.7, clipe: J.guarda },
  { a: 6.0, clipe: J.idle },
];
const trechosRicardo: Trecho[] = [
  { a: 0, clipe: R.investida },
  { a: 0.45, clipe: R.guarda },
  { a: 1.26, clipe: R.investida },
  { a: 1.68, clipe: R.soco },
  { a: 2.58, clipe: R.guarda },
  { a: 6.0, clipe: R.idle },
];

// Voo sustentado no contato (D33): o clipe de soco volta o corpo à vertical; aqui o tronco fica inclinado (~69°, a ~21° da horizontal)
// da investida até o recuo, e o braço do soco acompanha o eixo do corpo (como no clipe de voo). Só desvia a pose; a linha do tempo é a mesma.
const INCLINACAO_AEREA = 1.2;
const pesoAereo = (t: number) => curva(t, [[1.2, 0], [1.64, 1], [3.2, 1], [4.0, 0]]);
function aereo(p: Pose, t: number, braco: "rightArm" | "leftArm"): Pose {
  const w = pesoAereo(t);
  if (w <= 0) return p;
  const rot = { ...p.rot };
  rot.root = [p.rot.root[0] + (INCLINACAO_AEREA - p.rot.root[0]) * w, p.rot.root[1], p.rot.root[2]];
  const a = p.rot[braco];
  const estendido = Math.min(1, Math.max(0, -a[0] / 1.57));
  rot[braco] = [a[0] - 1.33 * w * estendido, a[1], a[2]];
  return { rot, pos: p.pos };
}

// D40: em investida, voo e choque a cabeça olha para o adversário, não para o chão. O pescoço compensa a inclinação do tronco: o
// ângulo da cabeça no mundo (tronco + pescoço) vai a ~0,1 rad (levemente para baixo) conforme o tronco passa de ~0,3 rad de inclinação.
const OLHAR_RESIDUAL = 0.1;
function olharAdversario(p: Pose): Pose {
  const incl = p.rot.root[0];
  const w = suave((incl - 0.3) / 0.6);
  if (w <= 0) return p;
  const h = p.rot.head;
  return { rot: { ...p.rot, head: [h[0] + (-(incl - OLHAR_RESIDUAL) - h[0]) * w, h[1], h[2]] }, pos: p.pos };
}

export const poseJoao = (t: number) => olharAdversario(aereo(poseDe(trechosJoao, t), t, "rightArm"));
export const poseRicardo = (t: number) => olharAdversario(aereo(poseDe(trechosRicardo, t), t, "leftArm"));
export const poseLuan = (t: number) => amostrar(CLIPES.luan.flutuar, t);

// Posição (x, y) e giro (rad; + olha para +x) de cada combatente. Esquerda/direita são do visitante (v4-03 §4).
export const joaoX = (t: number) => curva(t, [[0, -86], [0.45, -50], [1.2, -48], [2.0, -26], [2.12, -26], [3.2, -41], [4.0, -39], [4.8, -31], [6.0, -26]]);
export const ricardoX = (t: number) => -curva(t, [[0, -86], [0.45, -50], [1.26, -48], [2.0, -26], [2.12, -26], [3.2, -41], [4.0, -39], [4.8, -31], [6.0, -26]]);
export const combatenteY = (t: number) => curva(t, [[0, 2], [0.45, 2], [0.8, 0], [1.2, 0], [1.6, 4], [2.12, 4], [3.2, 6], [4.0, 0]]);
export const combatenteGiro = (t: number) => curva(t, [[0, 1.45], [0.45, 1.45], [0.85, 0.9], [1.2, 0.9], [1.5, 1.3], [3.2, 1.3], [4.0, 1.15], [4.8, 0.9]]);
export const luanY = (t: number) => curva(t, [[0, 80], [6.0, 80], [6.55, 30], [7.45, 32], [8, 32]]);
export const luanVisivel = (t: number) => t >= 5.9;

// Câmera (D33): plano geral, aproximação de até 3% antes do contato, lateral em leve 3/4 e baixa (olhando ~5° para cima) no choque,
// volta ao plano de 4 s, órbita curta de 5°, recuo e inclinação para cima na revelação do Luan. FOV fixo em 45°: sem zoom de impacto.
export function camera(t: number, comTremor = true) {
  const z = curva(t, [[0, 80], [1.2, 78], [3.2, 78], [4.0, 80], [6.0, 90], [7.45, 96], [8, 96]]);
  const baixa = curva(t, [[1.2, 0], [2.0, 1], [3.2, 1], [4.0, 0]]);
  const y = curva(t, [[0, 6], [6.0, 6], [6.4, 13], [7.45, 17], [8, 17]]) - 9 * baixa;
  const olhaY = curva(t, [[0, 2], [6.0, 2], [6.4, 13], [7.45, 17], [8, 17]]) + 1.5 * baixa;
  const az = ((curva(t, [[0, 0], [1.2, 0], [2.0, 12], [3.2, 12], [4.0, 0], [4.8, 5], [6.0, 5], [7.45, 2], [8, 2]])) * Math.PI) / 180;
  const fov = 45;
  // Único tremor amortecido: 2,15–2,40 s, até ~0,2 unidade (≈1,5 px na referência de 1152 px).
  const k = t > 2.15 && t < 2.4 ? 1 - (t - 2.15) / 0.25 : 0;
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
  const boost = curva(t, [[0, 0.3], [0.45, 0.24], [1.2, 0.19], [2.0, 0.36], [2.6, 0.3], [4.0, 0.24], [6.0, 0.19], [8, 0.19]]);
  return boost + (repouso - 0.19) * suave((t - 6) / 2);
}

// Efeitos pontuais.
// Realce ciano ligado ao ponto médio entre os punhos (x = 0; y acompanha o voo dos combatentes), com ~6–8% da largura do quadro.
export const nucleoDeImpacto = (t: number) => (t < 2.0 || t > 2.7 ? 0 : t < 2.2 ? suave((t - 2.0) / 0.2) : 1 - suave((t - 2.2) / 0.5));
export const PUNHOS_DY = -1; // altura dos punhos em relação ao centro do corpo no contato (ajustada no quadro de 2,1 s)
// Um anel pelo chão (v4-03 §4): nasce no choque (2,6 s), alcança as rochas entre 4,0 e 4,8 s e se dissipa até ~5,8 s.
export const anel = (t: number, atraso: number) => {
  const p = (t - 2.6 - atraso) / 3.2;
  return p < 0 || p > 1 ? null : { raio: 4 + 52 * saida(p), opacidade: 0.32 * (1 - p) ** 1.3 };
};
export const linhasDeVelocidade = (t: number) => (t < 0.5 ? 0.3 + t : t >= 1.2 && t <= 2.05 ? (t - 1.2) / 0.85 : null);

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
    lista.push({ tipo: "impacto", nasce: 2.0, vida: 0.8, p0: [0, 2, 4], v: [Math.cos(a) * vel, Math.sin(a) * vel * 0.8 + 4, (r() - 0.5) * 8], escala: 1.1, cor: coresImpacto[i % 4] });
  }
  for (let i = 0; i < 6; i++) {
    const lado = i % 2 ? 1 : -1;
    lista.push({ tipo: "fragmento", nasce: 4.0 + i * 0.12, vida: 1.7, p0: [lado * (38 + r() * 14), -15, -14 + r() * 8], v: [lado * (3 + r() * 4), 14 + r() * 7, -3 - r() * 3], escala: 2.0, cor: CORES.rochaClara });
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

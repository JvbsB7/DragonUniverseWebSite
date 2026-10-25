// Amostragem de clipes (sem dependências): suavizações, interpolação por osso, mistura de poses.
import { OSSOS, type Clipe, type Osso, type Pose, type Suavizacao, type Vec3 } from './tipos';

export const SUAVIZACOES: Record<Suavizacao, (k: number) => number> = {
  linear: (k) => k,
  suave: (k) => k * k * (3 - 2 * k),
  entra: (k) => k * k,
  sai: (k) => 1 - (1 - k) * (1 - k),
  entraSai: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  mola: (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }, // passa um pouco do alvo e volta
  degrau: (k) => (k >= 1 ? 1 : 0),
};

type Ponto = { t: number; v: Vec3; ease: Suavizacao };
type Trilhas = Map<string, Ponto[]>; // "rot:head" -> pontos
const cache = new WeakMap<Clipe, Trilhas>();
function trilhas(c: Clipe): Trilhas {
  let m = cache.get(c);
  if (m) return m;
  m = new Map();
  for (const ch of c.chaves) for (const canal of ['rot', 'pos'] as const) {
    const dados = ch[canal]; if (!dados) continue;
    for (const [osso, v] of Object.entries(dados) as [Osso, Vec3][]) {
      const k = `${canal}:${osso}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push({ t: ch.t, v, ease: ch.ease ?? 'suave' });
    }
  }
  for (const p of m.values()) p.sort((a, b) => a.t - b.t);
  cache.set(c, m);
  return m;
}
function valor(pts: Ponto[], t: number): Vec3 {
  if (t <= pts[0].t) return pts[0].v;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const a = pts[i - 1], b = pts[i];
      const s = SUAVIZACOES[b.ease]((t - a.t) / (b.t - a.t));
      return [a.v[0] + (b.v[0] - a.v[0]) * s, a.v[1] + (b.v[1] - a.v[1]) * s, a.v[2] + (b.v[2] - a.v[2]) * s];
    }
  }
  return pts[pts.length - 1].v;
}
export const poseNeutra = (): Pose => ({ rot: Object.fromEntries(OSSOS.map((o) => [o, [0, 0, 0]])) as Pose['rot'], pos: Object.fromEntries(OSSOS.map((o) => [o, [0, 0, 0]])) as Pose['pos'] });

/** Pose do clipe no instante t (s). Com loop, t dá a volta; sem loop, trava no fim. */
export function amostrar(c: Clipe, t: number): Pose {
  const tt = c.loop ? ((t % c.duracao) + c.duracao) % c.duracao : Math.min(Math.max(t, 0), c.duracao);
  const pose = poseNeutra();
  for (const [k, pts] of trilhas(c)) {
    const [canal, osso] = k.split(':') as ['rot' | 'pos', Osso];
    pose[canal][osso] = valor(pts, tt);
  }
  return pose;
}
/** Mistura duas poses (transição entre clipes: crossfade de 0,15–0,3 s). k=0 -> a, k=1 -> b. */
export function misturar(a: Pose, b: Pose, k: number): Pose {
  const out = poseNeutra();
  for (const canal of ['rot', 'pos'] as const) for (const o of OSSOS)
    out[canal][o] = [0, 1, 2].map((j) => a[canal][o][j] + (b[canal][o][j] - a[canal][o][j]) * k) as Vec3;
  return out;
}
/** Eventos do clipe que caem em (t0, t1] (para disparar efeitos uma vez por passagem). */
export function eventosEntre(c: Clipe, t0: number, t1: number): string[] {
  return (c.eventos ?? []).filter((e) => e.t > t0 && e.t <= t1).map((e) => e.nome);
}
/** Espelha esquerda/direita: troca os ossos e inverte Y/Z das rotações e X das posições. */
export function espelhar(c: Clipe, nome = c.nome): Clipe {
  const troca: Record<Osso, Osso> = { root: 'root', body: 'body', head: 'head', rightArm: 'leftArm', leftArm: 'rightArm', rightLeg: 'leftLeg', leftLeg: 'rightLeg' };
  return {
    ...c, nome,
    chaves: c.chaves.map((ch) => ({
      ...ch,
      rot: ch.rot && Object.fromEntries(Object.entries(ch.rot).map(([o, v]) => [troca[o as Osso], [v![0], -v![1], -v![2]]])),
      pos: ch.pos && Object.fromEntries(Object.entries(ch.pos).map(([o, v]) => [troca[o as Osso], [-v![0], v![1], v![2]]])),
    })),
  };
}

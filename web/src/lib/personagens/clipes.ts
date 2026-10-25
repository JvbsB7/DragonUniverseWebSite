// Biblioteca de clipes (dados) dos 3 personagens — lista do brief V4 §5. Valores AUTORAIS desta biblioteca, ajustados na folha de contato;
// não são medidas do jogo. Convenções em tipos.ts. Clipes de efeito (aura, rastro, nuvem) NÃO estão aqui: só o corpo.
import { espelhar } from './nucleo';
import type { Chave, Clipe, Vec3 } from './tipos';

const v = (x: number, y: number, z: number): Vec3 => [x, y, z];
// Pose de guarda (punhos à frente, pé esquerdo à frente)
const GUARDA = { rightArm: v(-1.15, 0.25, -0.15), leftArm: v(-1.0, -0.35, 0.15), rightLeg: v(0.3, 0, 0), leftLeg: v(-0.3, 0, 0), body: v(0.12, -0.15, 0), head: v(-0.08, 0.1, 0) };
// Braços cruzados estilo aldeão: os dois braços horizontais à frente do peito, sobrepostos. Braço rígido (sem cotovelo): rotação X ≈ -86° leva o
// braço à horizontal para a frente e Y ≈ ±83° o puxa para dentro (ponta cruza o centro). O pivô desce 4 px (altura do peito) e vai um pouco para fora
// (±1 px) para o par ficar centrado; o direito encosta no peito (z=4,4) e o esquerdo fica à frente (z=7,2), com deslocamentos em y/x de 0,3–0,4 px
// para as faces dos dois braços não ficarem coplanares (z-fighting).
const CRUZADOS = { rightArm: v(-1.5, 1.45, 0), leftArm: v(-1.5, -1.45, 0) };
const POS_CRUZADOS = { rightArm: v(-1, -4, 4.4), leftArm: v(1.4, -4.3, 7.2) };

// ---------- JvbsBR ----------
const jvbsIdle: Clipe = {
  nome: 'idle', duracao: 1.8, loop: true,
  chaves: [
    { t: 0, rot: { rightArm: v(-0.12, 0, -0.14), leftArm: v(-0.12, 0, 0.14), head: v(0, 0.08, 0), rightLeg: v(0.06, 0, 0), leftLeg: v(-0.06, 0, 0), body: v(0.04, 0, 0) }, pos: { body: v(0, 0, 0), head: v(0, 0, 0) } },
    { t: 0.9, rot: { rightArm: v(0.0, 0, -0.2), leftArm: v(0.0, 0, 0.2), head: v(0.04, -0.08, 0), body: v(0.02, 0, 0) }, pos: { body: v(0, 0.6, 0), head: v(0, 0.2, 0) } },
    { t: 1.8, rot: { rightArm: v(-0.12, 0, -0.14), leftArm: v(-0.12, 0, 0.14), head: v(0, 0.08, 0), body: v(0.04, 0, 0) }, pos: { body: v(0, 0, 0), head: v(0, 0, 0) } },
  ],
};
const jvbsGuarda: Clipe = {
  nome: 'guarda', duracao: 1.4, loop: true,
  chaves: [
    { t: 0, rot: GUARDA, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
    { t: 0.35, rot: { ...GUARDA, rightArm: v(-1.2, 0.3, -0.12), leftArm: v(-1.05, -0.3, 0.12) }, pos: { root: v(0, -0.7, 0), body: v(0, 0, 0.3) } },
    { t: 0.7, rot: GUARDA, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
    { t: 1.05, rot: { ...GUARDA, rightArm: v(-1.2, 0.3, -0.12), leftArm: v(-1.05, -0.3, 0.12) }, pos: { root: v(0, -0.7, 0), body: v(0, 0, 0.3) } },
    { t: 1.4, rot: GUARDA, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
  ],
};
const jvbsVoo: Clipe = {
  nome: 'voo', duracao: 1.6, loop: true, vista: 'lado',
  nota: 'Estilo Dragon Ball: corpo inclinado, um punho à frente, outro recuado. Deslocamento é da cena.',
  chaves: [
    { t: 0, rot: { root: v(0.95, 0, 0), head: v(-0.75, 0, 0), rightArm: v(-2.85, 0, -0.08), leftArm: v(0.55, 0, 0.22), rightLeg: v(0.35, 0, -0.04), leftLeg: v(0.12, 0, 0.04), body: v(0.05, 0, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 0.8, rot: { root: v(1.0, 0, 0), head: v(-0.8, 0, 0), rightArm: v(-2.95, 0, -0.1), leftArm: v(0.7, 0, 0.3), rightLeg: v(0.2, 0, -0.04), leftLeg: v(0.4, 0, 0.04) }, pos: { root: v(0, 1.2, 0) } },
    { t: 1.6, rot: { root: v(0.95, 0, 0), head: v(-0.75, 0, 0), rightArm: v(-2.85, 0, -0.08), leftArm: v(0.55, 0, 0.22), rightLeg: v(0.35, 0, -0.04), leftLeg: v(0.12, 0, 0.04) }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsInvestida: Clipe = {
  nome: 'investida', duracao: 0.5, loop: true, vista: 'lado',
  nota: 'Corrida aérea: braços varridos para trás. O avanço (x/z) vem da cena/câmera, não do clipe.',
  chaves: [
    { t: 0, rot: { root: v(1.25, 0, 0), head: v(-1.05, 0, 0), rightArm: v(1.05, 0, -0.18), leftArm: v(1.2, 0, 0.18), rightLeg: v(0.65, 0, 0), leftLeg: v(0.35, 0, 0), body: v(0.08, 0, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 0.25, rot: { rightArm: v(1.2, 0, -0.22), leftArm: v(1.05, 0, 0.22), rightLeg: v(0.35, 0, 0), leftLeg: v(0.65, 0, 0) }, pos: { root: v(0, 0.8, 0) } },
    { t: 0.5, rot: { root: v(1.25, 0, 0), head: v(-1.05, 0, 0), rightArm: v(1.05, 0, -0.18), leftArm: v(1.2, 0, 0.18), rightLeg: v(0.65, 0, 0), leftLeg: v(0.35, 0, 0), body: v(0.08, 0, 0) }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsSoco: Clipe = {
  nome: 'soco', duracao: 1.0, loop: false,
  eventos: [{ t: 0.36, nome: 'impacto' }],
  nota: 'Soco com o braço DIREITO. Guarda → recuo → impacto (t=0,36 s) → segura → volta. Use espelhar() para o braço esquerdo.',
  chaves: [
    { t: 0.0, rot: { ...GUARDA }, pos: { root: v(0, 0, 0) } },
    { t: 0.22, ease: 'sai', rot: { rightArm: v(0.7, 0.2, -0.3), leftArm: v(-1.3, -0.5, 0.1), body: v(0.05, -0.45, 0), head: v(0, 0.35, 0), rightLeg: v(0.4, 0, 0), leftLeg: v(-0.4, 0, 0) }, pos: { root: v(0, -0.5, -2) } },
    { t: 0.36, ease: 'entra', rot: { rightArm: v(-1.57, 0, -0.05), leftArm: v(0.5, 0.2, 0.2), body: v(0.1, 0.55, 0), head: v(0, -0.4, 0), rightLeg: v(-0.25, 0, 0), leftLeg: v(0.25, 0, 0) }, pos: { root: v(0, -0.5, 4) } },
    { t: 0.55, rot: { rightArm: v(-1.57, 0, -0.05), leftArm: v(0.5, 0.2, 0.2) }, pos: { root: v(0, -0.5, 4) } },
    { t: 1.0, ease: 'suave', rot: { ...GUARDA }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsCarregarKi: Clipe = {
  nome: 'carregarKi', duracao: 1.2, loop: true,
  eventos: [{ t: 0.3, nome: 'pulso' }, { t: 0.9, nome: 'pulso' }],
  nota: 'Pernas afastadas, punhos fechados ao lado, cabeça para cima; a aura é efeito da cena.',
  chaves: [
    { t: 0, rot: { body: v(-0.12, 0, 0), head: v(-0.3, 0, 0), rightArm: v(-0.15, 0, -0.55), leftArm: v(-0.15, 0, 0.55), rightLeg: v(0, 0, -0.2), leftLeg: v(0, 0, 0.2) }, pos: { root: v(0, -1.2, 0), body: v(0, 0, 0) } },
    { t: 0.3, rot: { body: v(-0.16, 0, 0), head: v(-0.38, 0, 0), rightArm: v(-0.2, 0, -0.8), leftArm: v(-0.2, 0, 0.8) }, pos: { root: v(0, -1.6, 0), body: v(0.3, 0, 0) } },
    { t: 0.6, rot: { body: v(-0.12, 0, 0), head: v(-0.3, 0, 0), rightArm: v(-0.15, 0, -0.55), leftArm: v(-0.15, 0, 0.55) }, pos: { root: v(0, -1.2, 0), body: v(-0.3, 0, 0) } },
    { t: 0.9, rot: { body: v(-0.16, 0, 0), head: v(-0.38, 0, 0), rightArm: v(-0.2, 0, -0.8), leftArm: v(-0.2, 0, 0.8) }, pos: { root: v(0, -1.6, 0), body: v(0.3, 0, 0) } },
    { t: 1.2, rot: { body: v(-0.12, 0, 0), head: v(-0.3, 0, 0), rightArm: v(-0.15, 0, -0.55), leftArm: v(-0.15, 0, 0.55) }, pos: { root: v(0, -1.2, 0), body: v(0, 0, 0) } },
  ],
};
const jvbsVitoria: Clipe = {
  nome: 'vitoria', duracao: 1.6, loop: false,
  eventos: [{ t: 0.45, nome: 'pose' }],
  nota: 'Salto curto, punho direito ao alto; o quadro final se mantém.',
  chaves: [
    { t: 0, rot: { ...GUARDA }, pos: { root: v(0, 0, 0) } },
    { t: 0.3, ease: 'sai', rot: { rightArm: v(-1.3, 0, -0.3), leftArm: v(0.3, 0, 0.5), body: v(-0.1, 0, 0), head: v(-0.2, 0, 0), rightLeg: v(0.25, 0, 0), leftLeg: v(-0.1, 0, 0) }, pos: { root: v(0, 3, 0) } },
    { t: 0.55, ease: 'entra', rot: { rightArm: v(-3.0, 0, -0.12), leftArm: v(-0.25, 0, 0.7), body: v(-0.14, 0.2, 0), head: v(-0.25, 0.15, 0), rightLeg: v(0, 0, -0.1), leftLeg: v(0, 0, 0.1) }, pos: { root: v(0, -0.6, 0) } },
    { t: 0.8, ease: 'mola', rot: { rightArm: v(-3.1, 0, -0.1), leftArm: v(-0.3, 0, 0.75), body: v(-0.14, 0.2, 0), head: v(-0.25, 0.15, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 1.6, ease: 'suave', rot: { rightArm: v(-3.1, 0, -0.12), leftArm: v(-0.3, 0, 0.75), body: v(-0.14, 0.2, 0), head: v(-0.25, 0.15, 0) }, pos: { root: v(0, 0.3, 0) } },
  ],
};
const jvbsMontarNuvem: Clipe = {
  nome: 'montarNuvem', duracao: 2.4, loop: true,
  nota: 'Sentado, pernas à frente na horizontal; a SUPERFÍCIE da nuvem fica ≈6 px abaixo da origem do PlayerObject (a conferir na cena). Voo horizontal/flutuar vertical são da cena.',
  chaves: [
    { t: 0, rot: { rightLeg: v(-1.5, 0.08, 0), leftLeg: v(-1.5, -0.08, 0), rightArm: v(-0.55, 0.25, -0.08), leftArm: v(-0.55, -0.25, 0.08), body: v(-0.04, 0, 0), head: v(0.02, 0.06, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 1.2, rot: { rightArm: v(-0.5, 0.25, -0.12), leftArm: v(-0.5, -0.25, 0.12), body: v(-0.07, 0, 0), head: v(0.06, -0.06, 0) }, pos: { root: v(0, 0.8, 0) } },
    { t: 2.4, rot: { rightArm: v(-0.55, 0.25, -0.08), leftArm: v(-0.55, -0.25, 0.08), body: v(-0.04, 0, 0), head: v(0.02, 0.06, 0) }, pos: { root: v(0, 0, 0) } },
  ],
};

// ---------- rvmm255 (mais rápido/agressivo; variantes espelhadas onde a luta pede) ----------
const rvmmIdle: Clipe = { ...espelhar(jvbsIdle), duracao: 1.5, chaves: espelhar(jvbsIdle).chaves.map((c) => ({ ...c, t: c.t * (1.5 / 1.8) })) };
const rvmmGuarda: Clipe = { ...espelhar(jvbsGuarda), nome: 'guarda', duracao: 1.2, chaves: espelhar(jvbsGuarda).chaves.map((c) => ({ ...c, t: c.t * (1.2 / 1.4) })) };
const rvmmVoo = espelhar(jvbsVoo, 'voo');
const rvmmInvestida: Clipe = { ...espelhar(jvbsInvestida), duracao: 0.42, chaves: espelhar(jvbsInvestida).chaves.map((c) => ({ ...c, t: c.t * (0.42 / 0.5) })) };
const rvmmSoco: Clipe = { ...espelhar(jvbsSoco, 'soco'), duracao: 0.9, nota: 'Soco com o braço ESQUERDO (espelho do soco do JvbsBR), 10% mais rápido. Impacto em t=0,32 s.', eventos: [{ t: 0.32, nome: 'impacto' }], chaves: espelhar(jvbsSoco).chaves.map((c) => ({ ...c, t: c.t * 0.9 })) };
const rvmmCarregarKi: Clipe = { ...jvbsCarregarKi, nome: 'carregarKi', duracao: 1.0, eventos: [{ t: 0.25, nome: 'pulso' }, { t: 0.75, nome: 'pulso' }], chaves: jvbsCarregarKi.chaves.map((c) => ({ ...c, t: c.t * (1.0 / 1.2) })) };
const rvmmDefesa: Clipe = {
  nome: 'defesa', duracao: 0.9, loop: true,
  eventos: [{ t: 0.15, nome: 'recuo' }],
  nota: 'Antebraços cruzados à frente do rosto, corpo agachado e recuado; treme de leve (loop de “segurando”).',
  chaves: [
    { t: 0, rot: { rightArm: v(-1.55, 0.85, 0.0), leftArm: v(-1.7, -0.85, 0), body: v(0.2, 0, 0), head: v(0.15, 0, 0), rightLeg: v(0.4, 0, -0.1), leftLeg: v(-0.5, 0, 0.1) }, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
    { t: 0.15, ease: 'sai', rot: { body: v(0.28, 0, 0), head: v(0.2, 0, 0) }, pos: { root: v(0, -1.5, -2.5), body: v(0, 0, 0) } },
    { t: 0.45, rot: { body: v(0.24, 0, 0), head: v(0.18, 0, 0) }, pos: { root: v(0, -1.5, -2.2), body: v(0.3, 0, 0) } },
    { t: 0.9, rot: { body: v(0.28, 0, 0), head: v(0.2, 0, 0) }, pos: { root: v(0, -1.5, -2.5), body: v(0, 0, 0) } },
  ],
};

// ---------- Luan Dias (presença, calma) ----------
const luanIdle: Clipe = {
  nome: 'idle', duracao: 3.2, loop: true,
  chaves: [
    { t: 0, rot: { rightArm: v(-0.04, 0, -0.1), leftArm: v(-0.04, 0, 0.1), head: v(0, 0.04, 0), body: v(0.02, 0, 0) }, pos: { body: v(0, 0, 0) } },
    { t: 1.6, rot: { rightArm: v(0.03, 0, -0.13), leftArm: v(0.03, 0, 0.13), head: v(0.03, -0.04, 0), body: v(0, 0, 0) }, pos: { body: v(0, 0.5, 0) } },
    { t: 3.2, rot: { rightArm: v(-0.04, 0, -0.1), leftArm: v(-0.04, 0, 0.1), head: v(0, 0.04, 0), body: v(0.02, 0, 0) }, pos: { body: v(0, 0, 0) } },
  ],
};
const luanFlutuar: Clipe = {
  nome: 'flutuar', duracao: 3.6, loop: true,
  nota: 'Flutua de braços cruzados: subida/descida suave de 2 px e pernas soltas; o vento/atmosfera são da cena.',
  chaves: [
    { t: 0, rot: { ...CRUZADOS, rightLeg: v(0.1, 0, -0.06), leftLeg: v(-0.06, 0, 0.06), head: v(0.05, 0.05, 0), root: v(0.04, 0, 0) }, pos: { ...POS_CRUZADOS, root: v(0, 0, 0) } },
    { t: 1.8, rot: { rightLeg: v(-0.04, 0, -0.1), leftLeg: v(0.08, 0, 0.1), head: v(0.02, -0.05, 0), root: v(-0.02, 0, 0) }, pos: { root: v(0, 2, 0) } },
    { t: 3.6, rot: { rightLeg: v(0.1, 0, -0.06), leftLeg: v(-0.06, 0, 0.06), head: v(0.05, 0.05, 0), root: v(0.04, 0, 0) }, pos: { root: v(0, 0, 0) } },
  ],
};
const luanBracosCruzados: Clipe = {
  nome: 'bracosCruzados', duracao: 3.2, loop: true,
  nota: 'Pose principal do Luan: dois braços horizontais sobrepostos à frente do peito (estilo aldeão). A camada externa da skin só existe no braço esquerdo (mantida), que fica na frente.',
  chaves: [
    { t: 0, rot: { ...CRUZADOS, head: v(0, 0, 0), body: v(0.02, 0, 0), rightLeg: v(0.04, 0, -0.04), leftLeg: v(-0.04, 0, 0.04) }, pos: { ...POS_CRUZADOS, body: v(0, 0, 0) } },
    { t: 1.6, rot: { ...CRUZADOS, head: v(0.03, 0.03, 0), body: v(0, 0, 0) }, pos: { ...POS_CRUZADOS, body: v(0, 0.4, 0) } },
    { t: 3.2, rot: { ...CRUZADOS, head: v(0, 0, 0), body: v(0.02, 0, 0) }, pos: { ...POS_CRUZADOS, body: v(0, 0, 0) } },
  ],
};
const luanOlharParaBaixo: Clipe = {
  nome: 'olharParaBaixo', duracao: 4, loop: true,
  chaves: [
    { t: 0, rot: { ...CRUZADOS, head: v(0.1, 0, 0), body: v(0.04, 0, 0) }, pos: { ...POS_CRUZADOS } },
    { t: 1.0, ease: 'entraSai', rot: { head: v(0.55, 0.06, 0), body: v(0.1, 0, 0) } },
    { t: 3.0, rot: { head: v(0.5, -0.06, 0), body: v(0.1, 0, 0) } },
    { t: 4.0, ease: 'entraSai', rot: { head: v(0.1, 0, 0), body: v(0.04, 0, 0) } },
  ],
};
const luanGiroSutil: Clipe = {
  nome: 'giroSutil', duracao: 6, loop: true,
  nota: 'Giro de ±0,4 rad em 6 s (≈23°) sobre o próprio eixo, flutuando de leve.',
  chaves: [
    { t: 0, rot: { ...CRUZADOS, root: v(0.03, -0.4, 0), head: v(0.05, 0.1, 0) }, pos: { root: v(0, 0, 0), ...POS_CRUZADOS } },
    { t: 3, ease: 'entraSai', rot: { root: v(0.03, 0.4, 0), head: v(0.05, -0.1, 0) }, pos: { root: v(0, 1.4, 0) } },
    { t: 6, ease: 'entraSai', rot: { root: v(0.03, -0.4, 0), head: v(0.05, 0.1, 0) }, pos: { root: v(0, 0, 0) } },
  ],
};

export type IdPersonagem = 'jvbsbr' | 'rvmm255' | 'luan';
export const CLIPES: Record<IdPersonagem, Record<string, Clipe>> = {
  jvbsbr: { idle: jvbsIdle, guarda: jvbsGuarda, voo: jvbsVoo, investida: jvbsInvestida, soco: jvbsSoco, carregarKi: jvbsCarregarKi, vitoria: jvbsVitoria, montarNuvem: jvbsMontarNuvem },
  rvmm255: { idle: rvmmIdle, guarda: rvmmGuarda, voo: rvmmVoo, investida: rvmmInvestida, soco: rvmmSoco, carregarKi: rvmmCarregarKi, defesa: rvmmDefesa },
  luan: { idle: luanIdle, flutuar: luanFlutuar, bracosCruzados: luanBracosCruzados, olharParaBaixo: luanOlharParaBaixo, giroSutil: luanGiroSutil },
};
export const SKINS: Record<IdPersonagem, string> = { jvbsbr: '/skins/jvbs.png', rvmm255: '/skins/rvmm.png', luan: '/skins/luan.png' };
export type { Chave };

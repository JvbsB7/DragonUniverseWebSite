// Biblioteca de clipes (dados) dos 3 personagens — lista do brief V4 §5. Valores AUTORAIS desta biblioteca, ajustados na folha de contato;
// não são medidas do jogo. Convenções em tipos.ts. Clipes de efeito (aura, rastro, nuvem) NÃO estão aqui: só o corpo.
import { espelhar } from './nucleo';
import type { Chave, Clipe, Vec3 } from './tipos';

const v = (x: number, y: number, z: number): Vec3 => [x, y, z];
// D40: em voo, investida e golpes aéreos a cabeça olha para o adversário. O pescoço compensa a inclinação do tronco (root + body):
// ângulo da cabeça no mundo = OLHAR_RESIDUAL (levemente para baixo), em vez de apontar para o chão.
const OLHAR_RESIDUAL = 0.1;
const olhar = (inclinacao: number): Vec3 => [OLHAR_RESIDUAL - inclinacao, 0, 0];
// Pose de guarda (punhos à frente, pé esquerdo à frente)
const GUARDA = { rightArm: v(-1.15, 0.25, -0.15), leftArm: v(-1.0, -0.35, 0.15), rightLeg: v(0.3, 0, 0), leftLeg: v(-0.3, 0, 0), body: v(0.12, -0.15, 0), head: v(-0.08, 0.1, 0) };
// Braços cruzados estilo aldeão: os dois braços horizontais à frente do peito, sobrepostos. Braço rígido (sem cotovelo): rotação X ≈ -86° leva o
// braço à horizontal para a frente e Y ≈ ±83° o puxa para dentro, cruzando o centro; as mãos saem 4 px além de cada lado do tronco. O direito fica
// atrás e mais baixo (z=4,4, y=-6,4) e o esquerdo à frente e mais alto (z=6,6, y=-3,2), com 0,8 px de sobreposição vertical e 2,2 px em z, o que
// separa os dois braços na leitura e evita faces coplanares (z-fighting). Pivôs a ±4 px do centro.
const CRUZADOS = { rightArm: v(-1.5, 1.45, 0), leftArm: v(-1.5, -1.45, 0) };
const POS_CRUZADOS = { rightArm: v(1, -6.4, 4.4), leftArm: v(-1, -3.2, 6.6) };

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
    { t: 0, rot: { root: v(0.95, 0, 0), head: olhar(1.0), rightArm: v(-2.85, 0, -0.08), leftArm: v(0.55, 0, 0.22), rightLeg: v(0.35, 0, -0.04), leftLeg: v(0.12, 0, 0.04), body: v(0.05, 0, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 0.8, rot: { root: v(1.0, 0, 0), head: olhar(1.05), rightArm: v(-2.95, 0, -0.1), leftArm: v(0.7, 0, 0.3), rightLeg: v(0.2, 0, -0.04), leftLeg: v(0.4, 0, 0.04) }, pos: { root: v(0, 1.2, 0) } },
    { t: 1.6, rot: { root: v(0.95, 0, 0), head: olhar(1.0), rightArm: v(-2.85, 0, -0.08), leftArm: v(0.55, 0, 0.22), rightLeg: v(0.35, 0, -0.04), leftLeg: v(0.12, 0, 0.04) }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsInvestida: Clipe = {
  nome: 'investida', duracao: 0.5, loop: true, vista: 'lado',
  nota: 'Corrida aérea: corpo quase horizontal, braços e pernas alinhados ao corpo (aerodinâmico). O avanço (x/z) vem da cena/câmera, não do clipe.',
  chaves: [
    { t: 0, rot: { root: v(1.25, 0, 0), head: olhar(1.31), rightArm: v(0.3, 0, -0.14), leftArm: v(0.45, 0, 0.14), rightLeg: v(0.25, 0, -0.04), leftLeg: v(0.1, 0, 0.04), body: v(0.06, 0, 0) }, pos: { root: v(0, 0, 0) } },
    { t: 0.25, rot: { rightArm: v(0.45, 0, -0.18), leftArm: v(0.3, 0, 0.18), rightLeg: v(0.1, 0, -0.04), leftLeg: v(0.25, 0, 0.04) }, pos: { root: v(0, 0.8, 0) } },
    { t: 0.5, rot: { root: v(1.25, 0, 0), head: olhar(1.31), rightArm: v(0.3, 0, -0.14), leftArm: v(0.45, 0, 0.14), rightLeg: v(0.25, 0, -0.04), leftLeg: v(0.1, 0, 0.04), body: v(0.06, 0, 0) }, pos: { root: v(0, 0, 0) } },
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

// ---------- Ataques de ki (D42) ----------
const PERNAS_BASE = { rightLeg: v(0.3, 0, -0.1), leftLeg: v(-0.3, 0, 0.1) };
const kamehamehaDireita: Clipe = {
  nome: 'kamehameha', duracao: 2.0, loop: false,
  eventos: [{ t: 0.05, nome: 'carga' }, { t: 0.55, nome: 'pulso' }, { t: 0.85, nome: 'pulso' }, { t: 1.0, nome: 'disparo' }, { t: 1.85, nome: 'fim' }],
  nota: 'Carga (0–0,95 s): agachado, tronco girado, as duas mãos juntas ao lado do quadril direito. Disparo (1,0 s): palmas à frente, braços na horizontal, mantido até 1,75 s; volta à guarda. O raio sai das palmas (≈ 12 px à frente do peito) — efeito da cena.',
  chaves: [
    { t: 0, rot: { ...GUARDA }, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
    { t: 0.4, ease: 'sai', rot: { body: v(0.1, -0.75, 0), head: v(0.02, 0.75, 0), rightArm: v(-0.3, 0.3, -0.05), leftArm: v(-0.85, -1.5, 0.1), rightLeg: v(0.15, 0, -0.32), leftLeg: v(-0.15, 0, 0.32) }, pos: { root: v(0, -2.2, 0), body: v(0, 0, 0) } },
    { t: 0.7, rot: { body: v(0.12, -0.8, 0), head: v(0.02, 0.8, 0), rightArm: v(-0.35, 0.3, -0.05), leftArm: v(-0.9, -1.5, 0.1) }, pos: { root: v(0, -2.5, 0), body: v(0.2, 0, 0) } },
    { t: 0.95, rot: { body: v(0.12, -0.85, 0), head: v(0.02, 0.85, 0), rightArm: v(-0.4, 0.3, -0.05), leftArm: v(-0.92, -1.5, 0.1) }, pos: { root: v(0, -2.6, -0.6), body: v(0, 0, 0) } },
    { t: 1.06, ease: 'entra', rot: { body: v(0.18, 0, 0), head: v(0, 0, 0), rightArm: v(-1.57, 0.3, -0.02), leftArm: v(-1.57, -0.3, 0.02), rightLeg: v(0.5, 0, -0.1), leftLeg: v(-0.5, 0, 0.1) }, pos: { root: v(0, -2, 3), body: v(0, 0, 0) } },
    { t: 1.3, rot: { rightArm: v(-1.6, 0.3, -0.02), leftArm: v(-1.6, -0.3, 0.02) }, pos: { root: v(0, -2, 3.4) } },
    { t: 1.75, rot: { rightArm: v(-1.57, 0.3, -0.02), leftArm: v(-1.57, -0.3, 0.02) }, pos: { root: v(0, -2, 3.2) } },
    { t: 2.0, ease: 'suave', rot: { ...GUARDA }, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
  ],
};
const jvbsKamehameha: Clipe = espelhar(kamehamehaDireita, 'kamehameha'); // mãos ao lado do quadril ESQUERDO: de perfil o tronco não esconde as mãos
const rvmmGalickGun: Clipe = {
  nome: 'galickGun', duracao: 2.0, loop: false,
  eventos: [{ t: 0.05, nome: 'carga' }, { t: 0.45, nome: 'pulso' }, { t: 1.0, nome: 'disparo' }, { t: 1.85, nome: 'fim' }],
  nota: 'Carga (0–0,9 s): antebraços cruzados à frente do peito, depois abertos para os lados (0,75 s). Disparo (1,0 s): as duas mãos à frente, palmas abertas, braços na horizontal, mantido até 1,75 s; volta à guarda. O raio sai das palmas — efeito da cena.',
  chaves: [
    { t: 0, rot: { ...GUARDA }, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
    { t: 0.4, ease: 'sai', rot: { ...CRUZADOS, body: v(0.08, 0, 0), head: v(0.05, 0, 0), rightLeg: v(0.2, 0, -0.28), leftLeg: v(-0.2, 0, 0.28) }, pos: { ...POS_CRUZADOS, root: v(0, -1.8, 0), body: v(0, 0, 0) } },
    { t: 0.6, rot: { body: v(0.1, 0, 0) }, pos: { ...POS_CRUZADOS, root: v(0, -2, 0) } },
    { t: 0.78, ease: 'sai', rot: { rightArm: v(-0.35, 0, -1.55), leftArm: v(-0.35, 0, 1.55), body: v(-0.1, 0, 0), head: v(-0.2, 0, 0) }, pos: { rightArm: v(0, 0, 0), leftArm: v(0, 0, 0), root: v(0, -2.2, -1) } },
    { t: 0.95, rot: { rightArm: v(-0.4, 0, -1.5), leftArm: v(-0.4, 0, 1.5) }, pos: { root: v(0, -2.2, -1.2) } },
    { t: 1.06, ease: 'entra', rot: { body: v(0.2, 0, 0), head: v(-0.05, 0, 0), rightArm: v(-1.57, 0.27, -0.02), leftArm: v(-1.57, -0.27, 0.02), rightLeg: v(0.5, 0, -0.12), leftLeg: v(-0.5, 0, 0.12) }, pos: { root: v(0, -2, 3) } },
    { t: 1.3, rot: { rightArm: v(-1.6, 0.27, -0.02), leftArm: v(-1.6, -0.27, 0.02) }, pos: { root: v(0, -2, 3.4) } },
    { t: 1.75, rot: { rightArm: v(-1.57, 0.27, -0.02), leftArm: v(-1.57, -0.27, 0.02) }, pos: { root: v(0, -2, 3.2) } },
    { t: 2.0, ease: 'suave', rot: { ...GUARDA }, pos: { root: v(0, 0, 0), body: v(0, 0, 0) } },
  ],
};

// ---------- Troca de golpes no ar (D41) ----------
// Tronco inclinado como na investida (~1,2 rad), pescoço compensando (D40). O avanço/recuo é da cena; aqui só o corpo.
const AEREO = { root: v(1.2, 0, 0), body: v(0.06, 0, 0), head: olhar(1.26), rightLeg: v(0.25, 0, -0.04), leftLeg: v(0.1, 0, 0.04), rightArm: v(0.3, 0, -0.14), leftArm: v(0.45, 0, 0.14) };
const jvbsGolpeAereo: Clipe = {
  nome: 'golpeAereo', duracao: 0.55, loop: false, vista: 'lado',
  eventos: [{ t: 0.2, nome: 'impacto' }],
  nota: 'Soco aéreo com o braço DIREITO: recuo (0,12 s) → impacto (0,2 s) com o braço no eixo do corpo → volta (0,55 s). Começa e termina na pose de voo.',
  chaves: [
    { t: 0, rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
    { t: 0.12, ease: 'sai', rot: { rightArm: v(0.6, 0.2, -0.25), leftArm: v(-2.7, -0.2, 0.1), body: v(0.06, -0.25, 0), head: [OLHAR_RESIDUAL - 1.26, 0.25, 0] }, pos: { root: v(0, -0.4, -2) } },
    { t: 0.2, ease: 'entra', rot: { rightArm: v(-2.9, 0, -0.05), leftArm: v(0.5, 0.2, 0.2), body: v(0.06, 0.25, 0), head: [OLHAR_RESIDUAL - 1.26, -0.25, 0] }, pos: { root: v(0, -0.4, 3) } },
    { t: 0.32, rot: { rightArm: v(-2.9, 0, -0.05), leftArm: v(0.5, 0.2, 0.2) }, pos: { root: v(0, -0.4, 3) } },
    { t: 0.55, ease: 'suave', rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsEsquivaAerea: Clipe = {
  nome: 'esquivaAerea', duracao: 0.5, loop: false, vista: 'lado',
  eventos: [{ t: 0.16, nome: 'desvio' }],
  nota: 'Esquiva no ar: o corpo rola de lado e desce ~4 px (0,16 s), volta à pose de voo em 0,5 s. Cabeça segue olhando o adversário.',
  chaves: [
    { t: 0, rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
    { t: 0.16, ease: 'sai', rot: { root: v(1.05, 0, 0.55), body: v(0.1, 0, 0), head: olhar(1.15), rightArm: v(0.5, 0, -0.4), leftArm: v(0.6, 0, 0.4) }, pos: { root: v(2.5, -4, -1.5) } },
    { t: 0.5, ease: 'suave', rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
  ],
};
const jvbsBloqueioAereo: Clipe = {
  nome: 'bloqueioAereo', duracao: 0.6, loop: false, vista: 'lado',
  eventos: [{ t: 0.14, nome: 'impacto' }],
  nota: 'Bloqueio no ar: antebraços cruzados à frente da cabeça (no eixo do corpo), recuo de 3 px no impacto (0,14 s), segura e volta à pose de voo.',
  chaves: [
    { t: 0, rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
    { t: 0.14, ease: 'sai', rot: { rightArm: v(-2.65, 0.55, 0), leftArm: v(-2.65, -0.55, 0), body: v(0.2, 0, 0), head: olhar(1.4) }, pos: { root: v(0, 0, -3) } },
    { t: 0.4, rot: { rightArm: v(-2.7, 0.5, 0), leftArm: v(-2.7, -0.5, 0), body: v(0.18, 0, 0) }, pos: { root: v(0, 0.4, -2.4) } },
    { t: 0.46, ease: 'entraSai', rot: { rightArm: AEREO.rightArm, leftArm: AEREO.leftArm, body: AEREO.body, head: AEREO.head }, pos: { root: v(0, 0.2, -1) } },
    { t: 0.6, ease: 'suave', rot: { ...AEREO }, pos: { root: v(0, 0, 0) } },
  ],
};
const rvmmGolpeAereo = espelhar(jvbsGolpeAereo, 'golpeAereo');
const rvmmEsquivaAerea = espelhar(jvbsEsquivaAerea, 'esquivaAerea');
const rvmmBloqueioAereo = espelhar(jvbsBloqueioAereo, 'bloqueioAereo');

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
  jvbsbr: { idle: jvbsIdle, guarda: jvbsGuarda, voo: jvbsVoo, investida: jvbsInvestida, soco: jvbsSoco, carregarKi: jvbsCarregarKi, vitoria: jvbsVitoria, montarNuvem: jvbsMontarNuvem, kamehameha: jvbsKamehameha, golpeAereo: jvbsGolpeAereo, esquivaAerea: jvbsEsquivaAerea, bloqueioAereo: jvbsBloqueioAereo },
  rvmm255: { idle: rvmmIdle, guarda: rvmmGuarda, voo: rvmmVoo, investida: rvmmInvestida, soco: rvmmSoco, carregarKi: rvmmCarregarKi, defesa: rvmmDefesa, galickGun: rvmmGalickGun, golpeAereo: rvmmGolpeAereo, esquivaAerea: rvmmEsquivaAerea, bloqueioAereo: rvmmBloqueioAereo },
  luan: { idle: luanIdle, flutuar: luanFlutuar, bracosCruzados: luanBracosCruzados, olharParaBaixo: luanOlharParaBaixo, giroSutil: luanGiroSutil },
};
export const SKINS: Record<IdPersonagem, string> = { jvbsbr: '/skins/jvbs.png', rvmm255: '/skins/rvmm.png', luan: '/skins/luan.png' };
export type { Chave };

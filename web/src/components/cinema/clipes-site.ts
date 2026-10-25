// Clipes próprios do site, no formato da biblioteca da Forja (lib/personagens), para gestos da v3 que a biblioteca não traz.
import type { Clipe } from "@/lib/personagens";

// Aceno do apresentador/João (v3): o braço esquerdo sobe para o lado, balança e volta ao repouso.
export const onda: Clipe = {
  nome: "onda",
  duracao: 1.8,
  loop: false,
  chaves: [
    { t: 0, rot: { leftArm: [0, 0, 0.05] } },
    { t: 0.3, ease: "suave", rot: { leftArm: [0, 0, 2.5], head: [0, 0.1, 0.04] } },
    { t: 0.6, ease: "suave", rot: { leftArm: [0.15, 0, 2.95] } },
    { t: 0.9, ease: "suave", rot: { leftArm: [-0.1, 0, 2.45] } },
    { t: 1.2, ease: "suave", rot: { leftArm: [0.15, 0, 2.95] } },
    { t: 1.5, ease: "suave", rot: { leftArm: [0, 0, 2.5], head: [0, 0.05, 0] } },
    { t: 1.8, ease: "suave", rot: { leftArm: [0, 0, 0.05], head: [0, 0, 0] } },
  ],
};

// Voo da v3 (Luan na equipe e na 404): tronco inclinado 0,55 rad para a frente, braços e pernas para trás, leve flutuação.
export const vooSuave: Clipe = {
  nome: "voo-suave",
  duracao: 2.0,
  loop: true,
  chaves: [
    { t: 0, rot: { root: [0.55, 0, 0], rightArm: [0.5, 0, -0.15], leftArm: [0.5, 0, 0.15], rightLeg: [0.25, 0, 0], leftLeg: [0.1, 0, 0], head: [-0.35, 0, 0] }, pos: { root: [0, 0, 0] } },
    { t: 1.0, ease: "suave", rot: { rightArm: [0.7, 0, -0.2], leftArm: [0.7, 0, 0.2], rightLeg: [0.1, 0, 0], leftLeg: [0.25, 0, 0] }, pos: { root: [0, 1, 0] } },
    { t: 2.0, ease: "suave", rot: { rightArm: [0.5, 0, -0.15], leftArm: [0.5, 0, 0.15], rightLeg: [0.25, 0, 0], leftLeg: [0.1, 0, 0] }, pos: { root: [0, 0, 0] } },
  ],
};

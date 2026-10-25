// Mídia da batalha da Home (v4-03 §3 e §5). Textos da Pena v4.2 (§2.4 e §2.5).
export const batalha = {
  /** Pôster desktop 2:1 (quadro de repouso da cena, gerado da própria cena). */
  poster: { src: "/img/batalha/batalha-poster-1152.webp", srcSet: "/img/batalha/batalha-poster-576.webp 576w, /img/batalha/batalha-poster-1152.webp 1152w", width: 1152, height: 576 },
  /** Clipe vertical pré-renderizado da Forja (3,6 s, D18) para o nível baixo. `null` desliga o botão e deixa só o pôster. */
  videoVertical: { mp4: "/video/batalha/mobile-vertical.mp4", webm: "/video/batalha/mobile-vertical.webm", poster: "/video/batalha/mobile-vertical-poster.webp", width: 720, height: 960 } as null | { mp4: string; webm: string; poster: string; width: number; height: number },
  alt: "Cena da equipe em repouso: JvbsBR e rvmm255 frente a frente, com auras azul e vermelha. Luan Dias flutua acima, de braços cruzados.",
  descricao:
    "A cena mostra, à esquerda, o JvbsBR (João Vitor), de cabelo preto e olhos azuis, com aura azul, e, à direita, o rvmm255 (Ricardo Vinicius), de cabelo vermelho e roupa vermelha, com aura vermelha. Os dois estão frente a frente num campo rochoso. Acima, no centro, Luan Dias flutua de braços cruzados e olha para baixo.",
  ariaAnimada:
    "Cena animada da equipe: JvbsBR, com aura azul, e rvmm255, com aura vermelha, se enfrentam, e Luan Dias observa de cima. Decorativa.",
} as const;

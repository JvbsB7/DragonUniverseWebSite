"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

// Dragão em blocos do fechamento das 7 esferas (D28/D32): folha de sprites 6 × 5 (quadros 400 × 300) da Forja, sem canvas e sem
// vídeo. A folha só é pedida quando a animação toca; o quadro final (a pose) fica parado e é o mesmo do pôster estático.
// Quadros e tempos de `dragao.json`: surgir (12 × 100 ms) e pose (4 × 250 ms). O "sumir" não toca: o dragão fica na tela.
const COLUNAS = 6;
const LINHAS = 5;
const QUADROS: { i: number; ms: number }[] = [
  ...Array.from({ length: 12 }, (_, i) => ({ i, ms: 100 })),
  ...Array.from({ length: 4 }, (_, i) => ({ i: 12 + i, ms: 250 })),
];
const ESCALA_CELULAR = 2.4 / 3.2; // celular: 2,4 s no total (v4-15 §0.3)

export const ALT_DRAGAO = "Dragão em blocos, no estilo do Minecraft, em volta das sete esferas.";

function Animacao({ onFim }: { onFim: () => void }) {
  const [quadro, setQuadro] = useState(0);

  useEffect(() => {
    const escala = window.matchMedia("(max-width: 767px)").matches ? ESCALA_CELULAR : 1;
    const timers: number[] = [];
    let t = 0;
    QUADROS.forEach((q) => {
      timers.push(window.setTimeout(() => setQuadro(q.i), t));
      t += q.ms * escala;
    });
    timers.push(window.setTimeout(onFim, t));
    return () => timers.forEach(clearTimeout);
  }, [onFim]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[#122344]"
      style={{
        backgroundImage: `image-set(url(${asset("/img/dragao/dragao-1x.webp")}) 1x, url(${asset("/img/dragao/dragao-2x.webp")}) 2x)`,
        backgroundSize: `${COLUNAS * 100}% ${LINHAS * 100}%`,
        backgroundPosition: `${((quadro % COLUNAS) * 100) / (COLUNAS - 1)}% ${(Math.floor(quadro / COLUNAS) * 100) / (LINHAS - 1)}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

/** `tocando` vira true uma vez por exibição; ao terminar, o quadro parado (pôster) volta a aparecer. */
export function Dragao({ tocando, onFim, reservaTopo = false }: { tocando: boolean; onFim: () => void; reservaTopo?: boolean }) {
  // `reservaTopo`: 64 px no alto da própria moldura para o balão do dragão (que fica dentro dela, sem faixa vazia entre a figura e o aro).
  return (
    <div role="img" aria-label={ALT_DRAGAO} className={`relative mx-auto w-full max-w-[400px] overflow-hidden rounded-md bg-[#122344] ${reservaTopo ? "aspect-[400/364]" : "aspect-[4/3]"}`}>
      <div className="absolute inset-x-0 bottom-0 aspect-[4/3]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/img/dragao/dragao-estatico-1x.webp")}
        srcSet={`${asset("/img/dragao/dragao-estatico-1x.webp")} 400w, ${asset("/img/dragao/dragao-estatico-2x.webp")} 800w`}
        sizes="(min-width: 480px) 400px, 100vw"
        alt=""
        width={400}
        height={300}
        className="absolute inset-0 h-full w-full"
      />
      {tocando && <Animacao onFim={onFim} />}
      </div>
    </div>
  );
}

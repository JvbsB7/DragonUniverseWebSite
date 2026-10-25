"use client";

import type { ReactNode } from "react";
import { LazyMotion, m, useReducedMotion, type MotionProps } from "motion/react";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";

// Motion for React, sob demanda (v3-01 §0.2): só `LazyMotion` e `m` entram no pacote da página; os recursos de animação
// (`domAnimation`, ~20 KB gz) só são baixados DEPOIS da primeira interação. Sem eles, `m.div` renderiza normalmente,
// então o conteúdo nunca depende de Motion para aparecer. Com movimento reduzido nada é animado.
const carregarRecursos = () =>
  new Promise<(typeof import("./motion-features"))["default"]>((resolve) => {
    const ir = () => import("./motion-features").then((r) => resolve(r.default));
    if (useSkinViewerStore.getState().interacted) return void ir();
    const cancelar = useSkinViewerStore.subscribe((s) => {
      if (s.interacted) {
        cancelar();
        ir();
      }
    });
    armFirstInteraction();
  });

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={carregarRecursos} strict>
      {children}
    </LazyMotion>
  );
}

/** Painel que troca de conteúdo em até 180 ms (v3-04-design.md §7.3). `trocou` evita animar o primeiro quadro. */
export function PainelAnimado({ chave, trocou, children, className }: { chave: string; trocou: boolean; children: ReactNode; className?: string }) {
  const reduzido = useReducedMotion();
  const animar = trocou && !reduzido;
  const props: MotionProps = animar
    ? { initial: { opacity: 0.4, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.18, ease: "easeOut" } }
    : {};
  return (
    <m.div key={chave} className={className} {...props}>
      {children}
    </m.div>
  );
}

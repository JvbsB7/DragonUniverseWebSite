"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { perfilLeve } from "@/lib/perfil";

// Motion for React, 100% sob demanda (v3-01 §0.2): nada do Motion entra no pacote da página. A troca de painel usa
// `animate` de "motion/mini" (Web Animations API, ~4 KB gz), importado por `import()` só na primeira troca feita pela
// pessoa. Medição: `LazyMotion` + `m` levavam ~30 KB gz para o caminho crítico da Home; esta forma leva 0.
// Sem Motion o conteúdo aparece igual (a troca só perde a transição). Perfil leve e movimento reduzido: sem animação.
export function MotionRoot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Painel que troca de conteúdo em até 180 ms (v3-04-design.md §7.3). `trocou` evita animar o primeiro quadro. */
export function PainelAnimado({ chave, trocou, children, className }: { chave: string; trocou: boolean; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !trocou || perfilLeve()) return;
    let cancelado = false;
    // Transição de ki (v4-03 §11.1): a borda do painel recebe energia por 220 ms; cancela a anterior em trocas rápidas.
    const moldura = el.parentElement;
    if (moldura) {
      moldura.classList.remove("ki-pulso");
      void moldura.offsetWidth;
      moldura.classList.add("ki-pulso");
    }
    import("motion/mini").then(({ animate }) => {
      if (cancelado) return;
      animate(el, { opacity: [0.4, 1], transform: ["translateY(6px)", "translateY(0px)"] }, { duration: 0.18, ease: "easeOut" });
    });
    return () => {
      cancelado = true;
    };
  }, [chave, trocou]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

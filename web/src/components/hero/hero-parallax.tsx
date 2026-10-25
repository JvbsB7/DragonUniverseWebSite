"use client";

import { useRef, type ReactNode } from "react";

// Profundidade 2.5D por CSS (design §8.6): com mouse (ponteiro fino), fora do perfil leve e sem movimento reduzido, a
// camada do print se desloca até 6 px. Só decoração: título, botões e a legenda ficam fora e nunca se mexem. A atualização
// acompanha o quadro de animação e para ao sair do elemento; sem loop ativo.
export function HeroParallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);

  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || document.documentElement.dataset.perfil !== "completo") return;
    const el = ref.current;
    if (!el) return;
    const x = e.clientX;
    const y = e.clientY;
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", (((x - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", (((y - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };
  const sair = () => {
    cancelAnimationFrame(quadro.current);
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  };

  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={sair} className={className}>
      {children}
    </div>
  );
}

"use client";

import { useRef, type ReactNode } from "react";

// Inclinação leve do card de raça (v3-04-design.md §7.2): no máximo 3° por eixo e 2 px de deslocamento, só com ponteiro
// fino e sem movimento reduzido. Texto, área clicável e foco ficam estáveis (o conteúdo não gira, só a placa e a luz).
// Teclado e toque não inclinam. O retorno ao repouso leva 180 ms.
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || document.documentElement.dataset.perfil === "leve") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
    el.style.setProperty("--lx", `${((x + 0.5) * 100).toFixed(0)}%`);
    el.style.setProperty("--ly", `${((y + 0.5) * 100).toFixed(0)}%`);
  };
  const sair = () => {
    const el = ref.current;
    if (!el) return;
    ["--rx", "--ry"].forEach((v) => el.style.setProperty(v, "0deg"));
  };

  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={sair} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

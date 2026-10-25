"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { aplicarPerfil } from "@/lib/perfil";

// Casca do cabeçalho v3: sticky enquanto a barra ocupar até 25% da altura visível (v3-04-design.md §6.2 e r1 §1);
// acima disso volta ao fluxo (texto ampliado, tela baixa). Publica a ocupação real em --du-header-offset, usada pelo
// scroll-padding/scroll-margin, para o foco e as âncoras nunca ficarem atrás da barra (WCAG 2.4.11). Tudo por DOM,
// sem estado do React, para não re-renderizar a cada medição.
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    aplicarPerfil();
    const root = document.documentElement;
    let fixa = true;
    const medir = () => {
      const topo = parseFloat(getComputedStyle(el).top) || 0;
      const ocupa = el.offsetHeight + topo;
      const limite = window.innerHeight * 0.25;
      // Histerese de 3 pontos percentuais: volta a fixar só abaixo de 22% .
      fixa = fixa ? ocupa <= limite : ocupa <= window.innerHeight * 0.22;
      el.dataset.fixa = fixa ? "true" : "false";
      root.style.setProperty("--du-header-offset", fixa ? `${Math.ceil(ocupa)}px` : "0px");
    };
    medir();
    // Foco nunca encoberto (WCAG 2.4.11): se um controle recebe foco por baixo da barra fixa, sem rolagem do navegador
    // (ex.: Shift+Tab com o item já parcialmente visível), a página rola o necessário, com 12 px de folga.
    const aoFocar = (e: FocusEvent) => {
      const alvo = e.target;
      if (!(alvo instanceof HTMLElement) || el.contains(alvo) || el.dataset.fixa !== "true") return;
      if (alvo.closest("dialog, [role='dialog']")) return;
      const limite = el.getBoundingClientRect().bottom + 12;
      const topo = alvo.getBoundingClientRect().top;
      if (topo < limite) window.scrollBy({ top: topo - limite, behavior: "instant" });
    };
    document.addEventListener("focusin", aoFocar);
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      ro.disconnect();
      window.removeEventListener("resize", medir);
      root.style.removeProperty("--du-header-offset");
    };
  }, []);

  return (
    <header
      ref={ref}
      data-fixa="true"
      className="sticky top-[calc(0.5rem+env(safe-area-inset-top,0px))] z-30 mt-2 data-[fixa=false]:static nav:top-4 nav:mt-4"
    >
      {children}
    </header>
  );
}

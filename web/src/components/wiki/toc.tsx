"use client";

import { useEffect, useRef } from "react";
import type { WikiHeading } from "@/lib/wiki-types";

// Sumário gerado dos ## e ### da página (§8.3). Celular: recolhível, "Nesta página" acima do artigo.
// A partir de 1100 px o efeito o abre e ele fica preso ao lado (sticky); sem JavaScript, continua recolhível. A rolagem fica só na lista, com folga interna,
// para que o aro de foco duplo do <summary> e dos links não seja cortado (QA R2-B1).
export function Toc({ headings }: { headings: WikiHeading[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 68.75rem)");
    const sync = () => {
      el.open = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (headings.length === 0) return null;
  return (
    // Fechado no HTML (celular, sem salto de layout depois do carregamento); o efeito o abre a partir de 1100 px.
    <details ref={ref} className="min-w-0 self-start rounded-xl border border-edge bg-surface px-4 py-1 nav:sticky nav:top-6 nav:col-start-2 nav:row-start-1">
      <summary className="flex min-h-12 cursor-pointer items-center font-display font-semibold text-brand">Nesta página</summary>
      <nav aria-label="Sumário da página" className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-3 pt-3 pb-4">
        <ul className="grid gap-1">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
              <a href={`#${h.id}`} className="flex min-h-12 items-center py-1 text-muted-foreground hover:text-text hover:underline">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

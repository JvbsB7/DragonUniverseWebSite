"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FalaSlot } from "@/components/fala/balao";
import { useNuvem } from "@/store/nuvem";
import { faixas } from "./faixas";
import { Nuvem } from "./nuvem";

// Faixa reservada da nuvem dourada (D45/D46): 128 px no desktop e 112 px no celular, sempre com a altura já no layout (sem
// deslocamento ao aparecer), vazia e decorativa. Só a nuvem entra aqui; nunca sobre texto ou botões.
export function FaixaNuvem({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ativa = useNuvem((s) => s.ativa === id);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const faixa = { id, el, visivelDesde: null as number | null };
    faixas.set(id + ":" + Math.random().toString(36).slice(2), faixa);
    const chave = [...faixas.entries()].find(([, f]) => f === faixa)?.[0];
    const io = new IntersectionObserver(([e]) => (faixa.visivelDesde = e.intersectionRatio >= 0.9 ? (faixa.visivelDesde ?? Date.now()) : null), { threshold: [0, 0.9, 1] });
    io.observe(el);
    return () => {
      io.disconnect();
      if (chave) faixas.delete(chave);
    };
  }, [id]);

  return (
    <div ref={ref} data-nuvem-faixa={id} className={cn("relative h-28 overflow-hidden md:h-32", className)}>
      <div aria-hidden="true" className="absolute inset-0">
        {ativa && <Nuvem />}
      </div>
      {/* Fala do aceno (D37): ao lado do sprite, dentro da faixa; fica fora do bloco aria-hidden para o anúncio chegar ao leitor de tela. */}
      <FalaSlot contexto="nuvem" faixa={id} className="absolute top-1/2 -translate-y-1/2" />
    </div>
  );
}

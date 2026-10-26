"use client";

import { useEffect, useRef } from "react";

// Reflexo de borda (v4-03 §11.3): um brilho percorre a borda superior da mídia em 1,2 s ao entrar na seção, uma vez por visita
// e por mídia. Sem movimento com "Reduzir animações" (o CSS global anula a animação). Decorativo.
const jaFeitos = new Set<string>();

export function ReflexoBorda({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || jaFeitos.has(id)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        jaFeitos.add(id);
        el.dataset.passando = "true";
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id]);
  return <span ref={ref} aria-hidden="true" className="reflexo-borda" />;
}

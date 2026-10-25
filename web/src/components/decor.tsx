import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Peças decorativas do design v2 (v2-04-design.md §2.3, §3.3 e §9.10). Nenhuma carrega informação: todas aria-hidden.

/** Faixa de energia sem texto. As cores só decoram, nunca indicam status. */
const strips = {
  hero: "linear-gradient(125deg, var(--du-energy-brand) 0 48%, var(--du-bg) 48% 53%, var(--du-energy-blue) 53% 79%, var(--du-energy-ssj) 79% 100%)",
  brand: "linear-gradient(125deg, var(--du-energy-brand) 0 58%, var(--du-raised) 58% 80%, var(--du-bg) 80% 100%)",
  news: "linear-gradient(90deg, var(--du-energy-blue) 0 65%, var(--du-energy-instinto) 65% 100%)",
  cta: "linear-gradient(120deg, var(--du-energy-ssj) 0 28%, var(--du-bg) 28% 32%, var(--du-energy-blue) 32% 72%, var(--du-energy-ego) 72% 100%)",
} as const;

export function EnergyStrip({ variant, className }: { variant: keyof typeof strips; className?: string }) {
  return <div aria-hidden="true" className={className} style={{ background: strips[variant] }} />;
}

/**
 * Esfera original de quatro estrelas (§9.10): octógono laranja com quatro estrelas de quatro pontas em matriz 2×2.
 * Decoração: sem significado de avaliação, quantidade ou progresso, sem animação.
 */
export function FourStars({ className }: { className?: string }) {
  const estrela = (cx: number, cy: number) => {
    const r = 3.6;
    return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 32 32"
      className={cn("size-6 shrink-0 md:size-8", className)}
    >
      <polygon
        points="10,1.5 22,1.5 30.5,10 30.5,22 22,30.5 10,30.5 1.5,22 1.5,10"
        fill="#F6B943"
        stroke="#060A16"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {[estrela(11.5, 11.5), estrela(20.5, 11.5), estrela(11.5, 20.5), estrela(20.5, 20.5)].map((d) => (
        <path key={d} d={d} fill="#060A16" />
      ))}
    </svg>
  );
}

/** Título de seção: filete azul de 6 px e, opcionalmente, o motivo de quatro estrelas (no máximo um por seção). */
export function SectionHeading({
  id,
  children,
  lead,
  stars = false,
  className,
}: {
  id: string;
  children: ReactNode;
  lead?: ReactNode;
  stars?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 grid gap-3", className)}>
      <div className="flex items-center gap-3">
        <h2 id={id} className="min-w-0 border-s-4 border-brand ps-4 [overflow-wrap:anywhere]">
          {children}
        </h2>
        {stars && <FourStars />}
      </div>
      {lead && <p className="max-w-[65ch] text-muted-foreground">{lead}</p>}
    </div>
  );
}

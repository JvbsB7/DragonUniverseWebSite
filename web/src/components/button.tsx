import type { ReactNode } from "react";
import Link from "next/link";
import { prefetchFor } from "@/lib/prefetch";

// Botões v3 (v3-04-design.md §7.1): raio 12 px, 48 px de altura (52 px no hero), Inter 600, sem sombra dura.
// Primário: fundo azul oficial com texto escuro (4,68:1); o hover não muda o preenchimento, só a iluminação e o contorno.
const base =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-center text-base leading-6 font-semibold [overflow-wrap:anywhere] transition-[box-shadow,transform] duration-(--du-motion-fast) ease-du-out active:translate-y-px";

const variants = {
  primary: "bg-action text-bg shadow-block-button hover:shadow-block-button-hover active:shadow-block-button-pressed",
  secondary: "border border-border bg-surface text-text hover:bg-raised",
} as const;

type Variant = keyof typeof variants;

/** Classes do botão, para controles que não são <a>/<Link> (ex.: fechar do menu). */
export function buttonClass(variant: Variant = "secondary", size: "md" | "lg" = "md") {
  return `${base} ${variants[variant]}${size === "lg" ? " min-h-13 md:px-6" : ""}`;
}

export function LinkButton({
  href,
  children,
  variant = "secondary",
  external = false,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const cls = `${buttonClass(variant, size)} ${className}`.trim();
  // Rotas internas usam next/link (respeita o basePath da implantação em subpasta).
  if (!external) {
    return (
      <Link href={href} prefetch={prefetchFor(href)} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (abre em uma nova aba)</span>
    </a>
  );
}

// Controle indisponível (v3-06 M3, W6): aria-disabled (focável, com o foco duplo), contorno de 3:1, texto sem opacidade,
// type="button" sem manipulador (nada acontece ao clicar) e sem href. O "Em breve" aparece em texto visível junto do botão.
export function SoonButton({ label, note, ariaLabel }: { label: string; note: string; ariaLabel?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-disabled="true"
        aria-label={ariaLabel ?? `${label}: indisponível, em breve`}
        className="inline-flex min-h-12 max-w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface px-5 py-2.5 text-center text-base leading-6 font-semibold text-muted-foreground [overflow-wrap:anywhere]"
      >
        {label}
      </button>
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

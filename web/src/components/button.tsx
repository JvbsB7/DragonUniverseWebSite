import type { ReactNode } from "react";
import Link from "next/link";
import { prefetchFor } from "@/lib/prefetch";

// Botões e links de ação (v2-04-design.md §9.1): 48 px, borda de 2 px, sombra dura, quebra de linha permitida.
const base =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 border-2 px-5 py-2.5 text-center font-display text-base leading-6 font-semibold [overflow-wrap:anywhere] shadow-block-button transition-colors duration-(--du-motion-fast) ease-du-out active:shadow-block-button-pressed";

const variants = {
  primary: "border-bg bg-action text-bg hover:bg-action-hover active:bg-action-pressed",
  secondary: "border-border bg-surface text-brand hover:bg-raised",
} as const;

type Variant = keyof typeof variants;

export function LinkButton({
  href,
  children,
  variant = "secondary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
}) {
  // Rotas internas usam next/link (respeita o basePath da implantação em subpasta).
  if (!external) {
    return (
      <Link href={href} prefetch={prefetchFor(href)} className={`${base} ${variants[variant]}`}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`${base} ${variants[variant]}`} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (abre em uma nova aba)</span>
    </a>
  );
}

// Botão sem destino: aparece desabilitado com a explicação ao lado (copy §15). Sem opacidade nem sombra.
export function SoonButton({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled
        aria-label={`${label}: em breve, ainda sem link disponível`}
        className="inline-flex min-h-12 max-w-full cursor-not-allowed items-center justify-center gap-2 border-2 border-disabled bg-disabled px-5 py-2.5 text-center font-display text-base leading-6 font-semibold text-muted-foreground [overflow-wrap:anywhere]"
      >
        {label}
      </button>
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

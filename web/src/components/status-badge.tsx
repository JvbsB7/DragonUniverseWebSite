import type { ReactNode } from "react";

// Selos v3 (v3-04-design.md §7.6 e copy v3 A.1). Fundo opaco, texto de 14 px com rótulo completo e uma forma geométrica
// que acompanha o texto (nunca o substitui). Não existe selo "Experimental" nem "Lançado": "no jogo" = "Já no jogo".
const styles = {
  live: "text-live-fg",
  dev: "text-dev-fg",
  preview: "text-preview-fg",
  test: "text-gold",
  planned: "text-planned-fg",
  soon: "text-muted-foreground",
} as const;

export type Status = keyof typeof styles;

const labels: Record<Status, string> = {
  live: "Já no jogo",
  dev: "Em desenvolvimento",
  preview: "Em desenvolvimento · Prévia",
  test: "Em teste",
  planned: "Planejado",
  soon: "Em breve",
};

// Marca de conclusão, pontos, losango vazado, losango cheio, traço e quadrado vazado.
function Shape({ status }: { status: Status }) {
  const common = { "aria-hidden": true, focusable: false, viewBox: "0 0 12 12", className: "size-3 shrink-0" } as const;
  switch (status) {
    case "live":
      return (
        <svg {...common}>
          <path d="M2 6.5l2.6 2.6L10 3.4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "dev":
      return (
        <svg {...common}>
          <circle cx="2.5" cy="6" r="1.5" fill="currentColor" />
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <circle cx="9.5" cy="6" r="1.5" fill="currentColor" />
        </svg>
      );
    case "preview":
      return (
        <svg {...common}>
          <path d="M6 1.2L10.8 6 6 10.8 1.2 6z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "test":
      return (
        <svg {...common}>
          <path d="M6 1.2L10.8 6 6 10.8 1.2 6z" fill="currentColor" />
        </svg>
      );
    case "planned":
      return (
        <svg {...common}>
          <path d="M2 6h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="1.8" y="1.8" width="8.4" height="8.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }
}

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-sm border border-edge-hover bg-surface px-2 py-1 font-game text-sm leading-[1.57] font-semibold [overflow-wrap:anywhere] ${styles[status]}`}
    >
      <Shape status={status} />
      {children ?? labels[status]}
    </span>
  );
}

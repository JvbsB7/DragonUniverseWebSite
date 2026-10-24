import type { ReactNode } from "react";

// Cores de v2-04-design.md §3.11 e §9.7. Texto sempre com fundo próprio e borda de 1 px na cor do texto.
const styles = {
  live: "bg-live-bg text-live-fg",
  dev: "bg-dev-bg text-dev-fg",
  preview: "bg-preview-bg text-preview-fg",
  planned: "bg-planned-bg text-planned-fg",
  soon: "bg-disabled text-muted-foreground",
} as const;

export type Status = keyof typeof styles;

const labels: Record<Status, string> = {
  live: "Já no jogo",
  dev: "Em desenvolvimento",
  preview: "Em desenvolvimento · Prévia",
  planned: "Planejado",
  soon: "Em breve",
};

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex w-fit max-w-full items-center border border-current px-2 py-1 font-display text-sm leading-[1.57] font-semibold [overflow-wrap:anywhere] ${styles[status]}`}
    >
      {children ?? labels[status]}
    </span>
  );
}

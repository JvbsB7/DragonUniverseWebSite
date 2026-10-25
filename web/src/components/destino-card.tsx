import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { Destino } from "@/config/universo";
import { comoChegar } from "@/config/universo";

// Cartão de destino da Home (design §7.4): nome, status, descrição e link. Sem imagem confirmada, versão textual.
export function DestinoCard({ d }: { d: Destino }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-3 rounded-xl border border-edge bg-surface p-5 shadow-block-card md:p-6">
      <StatusBadge status={d.status === "preview" ? "preview" : d.status === "planned" ? "planned" : "live"} />
      <h3 className="text-card-title">{d.nome}</h3>
      <p className="max-w-[65ch] text-muted-foreground">{d.texto}</p>
      {d.status === "live" && <p className="text-muted-foreground">{comoChegar}</p>}
      <div className="mt-auto pt-2">
        <Link
          href={`/wiki/planetas-e-dimensoes/${d.slug}`}
          className="inline-flex min-h-12 items-center text-base font-semibold text-brand underline underline-offset-4"
        >
          Ver na wiki<span className="sr-only">: {d.nome}</span>
        </Link>
      </div>
    </article>
  );
}

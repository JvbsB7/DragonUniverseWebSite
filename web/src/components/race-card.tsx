import Link from "next/link";
import type { Raca } from "@/config/racas";
import { StatusBadge, type Status } from "@/components/status-badge";
import { TiltCard } from "@/components/tilt-card";
import { Expandable } from "@/components/expandable";
import { prefetchFor } from "@/lib/prefetch";

const statusMap: Record<Raca["status"], Status> = { live: "live", dev: "dev", planned: "planned" };

// Card de raça v3 (v3-04-design.md §7.2; copy §3.2): nome, selo, descrição, pontos fortes (só com dado), link e, nas
// raças em desenvolvimento, "O que a equipe quer construir" (direção, não recurso pronto). Sem imagem enquanto não
// houver arte oficial da raça: card textual, sem personagem genérico. Os cards em desenvolvimento ganham filete ciano
// e contorno tracejado, com texto e fundo iguais aos demais. Não são ligados a nenhum nível de apoio.
export function RaceCard({ raca }: { raca: Raca }) {
  const dev = raca.status === "dev";
  const href = `/wiki/racas/${raca.wiki}`;
  return (
    <TiltCard className="h-full">
      <article
        data-race={raca.slug}
        className={`tilt-face relative flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-surface p-5 shadow-block-card md:p-6 ${
          dev ? "border border-dashed border-border pt-7" : "border border-edge"
        }`}
      >
        {dev ? (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-brand" />
        ) : (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--du-item-energy)" }} />
        )}
        <StatusBadge status={statusMap[raca.status]} />
        <h3 className="text-card-title">{raca.nome}</h3>
        <p className="max-w-[65ch] text-muted-foreground">{raca.descricao}</p>
        {raca.pontosFortes && !raca.direcao && (
          <Expandable>
            <div className="grid gap-1 pt-1">
              <h4 className="font-game text-sm font-semibold text-text">Pontos fortes</h4>
              <p className="text-muted-foreground">{raca.pontosFortes}</p>
            </div>
          </Expandable>
        )}
        {raca.direcao && (
          <div className="grid gap-1">
            <h4 className="font-game text-sm font-semibold text-text">O que a equipe quer construir</h4>
            <p className="text-sm text-muted-foreground">(pode mudar durante o desenvolvimento)</p>
            <ul className="list-disc ps-5 text-muted-foreground">
              {raca.direcao.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto pt-2">
          <Link
            href={href}
            prefetch={prefetchFor(href)}
            aria-label={`Ver detalhes de ${raca.nome}`}
            className="inline-flex min-h-12 items-center text-base font-semibold text-brand underline underline-offset-4 hover:decoration-[0.14em]"
          >
            Ver detalhes
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

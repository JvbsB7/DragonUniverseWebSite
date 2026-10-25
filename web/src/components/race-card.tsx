import Link from "next/link";
import type { Raca } from "@/config/racas";
import { StatusBadge, type Status } from "@/components/status-badge";
import { prefetchFor } from "@/lib/prefetch";
import { asset, assetSet } from "@/lib/asset";

const statusMap: Record<Raca["status"], Status> = { live: "live", dev: "dev", planned: "planned" };

// Card 100% de servidor (sem hidratação): a inclinação é só CSS e "Mostrar mais" é um <details> nativo, que já expõe o estado
// aberto/fechado a leitores de tela. Card de raça v3 (v3-04-design.md §7.2; copy §3.2): nome, selo, descrição, pontos fortes (só com dado), link e, nas
// raças em desenvolvimento, "O que a equipe quer construir" (direção, não recurso pronto). Sem imagem enquanto não
// houver arte oficial da raça: card textual, sem personagem genérico. Os cards em desenvolvimento ganham filete ciano
// e contorno tracejado, com texto e fundo iguais aos demais. Não são ligados a nenhum nível de apoio.
export function RaceCard({ raca, titulo = "h4" }: { raca: Raca; titulo?: "h3" | "h4" }) {
  const H = titulo;
  const dev = raca.status === "dev";
  const href = `/wiki/racas/${raca.wiki}`;
  return (
    <div className="tilt-card h-full">
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
        {raca.poster && (
          <div className="relative h-64 overflow-hidden rounded-md bg-bg">
            {/* Poster 2.5D do modelo e da textura do add-on (368×460 e 736×920). Dimensões fixas: sem deslocamento de layout. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(`/img/racas/${raca.slug}-368.webp`)}
              srcSet={assetSet(`/img/racas/${raca.slug}-368.webp 368w, /img/racas/${raca.slug}-736.webp 736w`)}
              sizes="218px"
              width={368}
              height={460}
              loading="lazy"
              decoding="async"
              alt={raca.poster.alt}
              className="absolute top-[50%] left-1/2 h-[17rem] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        )}
        <H className="text-card-title">{raca.nome}</H>
        <p className="max-w-[65ch] text-muted-foreground">{raca.descricao}</p>
        {raca.pontosFortes && !raca.direcao && (
          <details className="group">
            <summary className="inline-flex min-h-12 w-fit cursor-pointer list-none items-center rounded-md px-1 text-base font-semibold text-brand underline underline-offset-4 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Mostrar mais</span>
              <span className="hidden group-open:inline">Mostrar menos</span>
            </summary>
            <div className="grid gap-1 pt-1">
              <p className="font-game text-sm font-semibold text-text">Pontos fortes</p>
              <p className="text-muted-foreground">{raca.pontosFortes}</p>
            </div>
          </details>
        )}
        {raca.direcao && (
          <div className="grid gap-1">
            <p className="font-game text-sm font-semibold text-text">O que a equipe quer construir</p>
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
    </div>
  );
}

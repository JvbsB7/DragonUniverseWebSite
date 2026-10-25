"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge, type Status } from "@/components/status-badge";
import { MotionRoot, PainelAnimado } from "@/components/motion-lazy";
import { asset, assetSet } from "@/lib/asset";
import { cn } from "@/lib/utils";
import { avisoUniverso, comoChegar, type Destino, type DestinoStatus } from "@/config/universo";

const statusMap: Record<DestinoStatus, Status> = { live: "live", preview: "preview", planned: "planned" };
const filtros: { id: "todos" | DestinoStatus; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "live", rotulo: "Já no jogo" },
  { id: "preview", rotulo: "Em desenvolvimento · Prévia" },
  { id: "planned", rotulo: "Planejado" },
];

function Painel({ d }: { d: Destino }) {
  const wiki = `/wiki/planetas-e-dimensoes/${d.slug}`;
  return (
    <div className="grid min-w-0 content-start gap-3">
      <StatusBadge status={statusMap[d.status]} />
      <h3 className="text-card-title">{d.nome}</h3>
      <p className="max-w-[65ch]">{d.texto}</p>
      {d.status === "live" && <p className="text-muted-foreground">{comoChegar}</p>}
      {d.imagem ? (
        <figure className="grid gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(d.imagem.src)}
            srcSet={d.imagem.srcSet ? assetSet(d.imagem.srcSet) : undefined}
            sizes="(min-width: 1100px) 480px, calc(100vw - 4rem)"
            alt={d.imagem.alt}
            width={d.imagem.width}
            height={d.imagem.height}
            loading="lazy"
            className="h-auto w-full max-w-lg rounded-md border border-edge bg-bg object-contain"
          />
          <figcaption className="text-sm text-muted-foreground">
            <StatusBadge status="preview" /> {d.imagem.legenda} Ainda não está no add-on.
          </figcaption>
        </figure>
      ) : (
        <p className="grid min-h-24 max-w-lg place-items-center rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Imagem em breve</p>
      )}
      <div>
        <Link href={wiki} className="inline-flex min-h-12 items-center text-base font-semibold text-brand underline underline-offset-4">
          Ver na wiki<span className="sr-only">: {d.nome}</span>
        </Link>
      </div>
    </div>
  );
}

// Explorador do universo (v3-04-design.md §9.4; copy §7): filtros por status, lista de destinos e painel do selecionado.
// Só destinos documentados, sem planetas inventados nem mapa factual. No celular o painel abre logo abaixo do destino
// escolhido; no desktop fica numa coluna ao lado. Seleção por botão (teclado e toque); nada exige arrastar.
export function UniversoShowcase({ destinos }: { destinos: Destino[] }) {
  const [filtro, setFiltro] = useState<"todos" | DestinoStatus>("todos");
  const [atual, setAtual] = useState(destinos[0].slug);
  const [trocou, setTrocou] = useState(false);

  const lista = destinos.filter((d) => filtro === "todos" || d.status === filtro);
  const d = lista.find((x) => x.slug === atual) ?? lista[0];

  return (
    <MotionRoot>
      <div className="grid gap-4">
        <div role="group" aria-label="Filtrar destinos por status" className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={cn(
                "inline-flex min-h-12 max-w-full items-center rounded-md border px-3 py-1 text-start text-base font-semibold [overflow-wrap:anywhere]",
                filtro === f.id ? "border-brand bg-brand text-bg" : "border-border bg-surface text-text hover:bg-raised",
              )}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{d ? `Mostrando ${d.nome}. ${lista.length} destinos na lista.` : "Nenhum destino neste filtro."}</p>
        <div className="grid gap-6 nav:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] nav:items-start">
          <ul aria-label="Destinos do universo" className="grid min-w-0 gap-2">
            {lista.map((x) => {
              const sel = x.slug === d?.slug;
              return (
                <li key={x.slug} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={sel}
                    onClick={() => {
                      setTrocou(true);
                      setAtual(x.slug);
                    }}
                    className={cn(
                      "flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 text-start text-base font-semibold",
                      sel ? "border-brand bg-raised shadow-[inset_4px_0_0_var(--du-brand)]" : "border-border bg-surface hover:bg-raised",
                    )}
                  >
                    <span className="min-w-0">{x.nome}</span>
                  </button>
                  {sel && (
                    <div className="mt-2 rounded-xl border border-edge bg-surface p-5 nav:hidden">
                      <PainelAnimado chave={x.slug} trocou={trocou}>
                        <Painel d={x} />
                      </PainelAnimado>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="hidden min-w-0 rounded-xl border border-edge bg-surface p-6 shadow-block-card nav:block">
            {d ? (
              <PainelAnimado chave={d.slug} trocou={trocou}>
                <Painel d={d} />
              </PainelAnimado>
            ) : (
              <p>Nada aqui por enquanto.</p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{avisoUniverso}</p>
      </div>
    </MotionRoot>
  );
}

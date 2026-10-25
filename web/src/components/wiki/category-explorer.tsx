"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { LinkButton } from "@/components/button";
import { WikiStatusBadge } from "@/components/wiki/wiki-status";
import { chip, chipOff, chipOn } from "@/components/wiki/wiki-explorer";
import { links } from "@/config/links";
import { fold, statusLabel, wikiStatuses, type WikiStatus } from "@/lib/wiki-types";
import { cn } from "@/lib/utils";

export type CategoryPage = { slug: string; title: string; description: string; status: WikiStatus };

// Busca e filtros só desta categoria (copy v2.2 §4). Cards textuais, sem caixas de imagem vazias (§8.2 e §9.2).
export function CategoryExplorer({ category, title, pages }: { category: string; title: string; pages: CategoryPage[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<WikiStatus | null>(null);
  const active = query.trim() !== "" || status !== null;

  const results = useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    return pages.filter(
      (p) =>
        (status === null || p.status === status) &&
        terms.every((t) => fold(`${p.title} ${p.description}`).includes(t)),
    );
  }, [pages, query, status]);

  const clear = () => {
    setQuery("");
    setStatus(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <search aria-label={`Buscar páginas da categoria ${title}`} className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="categoria-busca" className="mb-2 block font-display font-semibold">
            Buscar em {title}
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-3 size-5 text-muted-foreground" />
          <input
            id="categoria-busca"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar em ${title}…`}
            autoComplete="off"
            className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface pr-4 pl-10 text-text placeholder:text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Nesta página, a busca considera os títulos e as descrições da categoria {title}. Escolha outra categoria para consultar outros assuntos.
          </p>
        </div>

        <fieldset aria-label="Filtrar páginas por status" className="flex min-w-0 flex-col gap-2">
          <legend aria-hidden="true" className="mb-1 font-display text-sm font-semibold text-muted-foreground">Filtrar por status</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={status === null} onClick={() => setStatus(null)} className={cn(chip, status === null ? chipOn : chipOff)}>
              Todos
            </button>
            {wikiStatuses.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => setStatus(status === s ? null : s)}
                className={cn(chip, status === s ? chipOn : chipOff)}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </fieldset>

        {active && (
          <div>
            <button type="button" onClick={clear} className={cn(chip, chipOff, "gap-2")}>
              <X aria-hidden="true" className="size-4" />
              Limpar busca e filtros
            </button>
          </div>
        )}
      </search>

      <p role="status" className="sr-only">
        {results.length === 1 ? "1 resultado encontrado" : `${results.length} resultados encontrados`}
      </p>

      {results.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 nav:grid-cols-3 nav:gap-6">
          {results.map((p) => (
            <li key={p.slug} className="min-w-0">
              <Link
                href={`/wiki/${category}/${p.slug}`}
                className="flex h-full min-w-0 flex-col gap-2 rounded-xl border border-edge bg-surface p-4 shadow-block-card hover:bg-raised md:p-5"
              >
                <span className="font-display text-lg font-semibold [overflow-wrap:anywhere]">{p.title}</span>
                <WikiStatusBadge status={p.status} />
                <span className="text-sm text-muted-foreground">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-surface p-6">
          <p className="font-display text-lg font-semibold">Nenhuma página encontrada</p>
          <p className="text-muted-foreground [overflow-wrap:anywhere]">
            {query.trim() ? `Não achamos nada para “${query.trim()}”. ` : "Não achamos nada com esses filtros. "}
            Tente outra palavra ou limpe os filtros.
          </p>
          <button type="button" onClick={clear} className={cn(chip, chipOff)}>
            Limpar busca e filtros
          </button>
          <p className="font-display font-semibold">Sentiu falta de algo? Conte para a equipe no Discord.</p>
          <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
        </div>
      )}
    </div>
  );
}

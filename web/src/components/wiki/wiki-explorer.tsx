"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { LinkButton } from "@/components/button";
import { WikiStatusBadge } from "@/components/wiki/wiki-status";
import { links } from "@/config/links";
import { asset } from "@/lib/asset";
import { useWikiFilters } from "@/store/wiki-filters";
import { fold, statusLabel, wikiStatuses, type WikiIndexItem } from "@/lib/wiki-types";
import { cn } from "@/lib/utils";

export type CategoryCard = { slug: string; title: string; description: string; count: number };

export const chip =
  "inline-flex min-h-12 items-center border-2 px-3 font-display text-base font-semibold transition-colors duration-(--du-motion-fast)";
export const chipOff = "border-border bg-surface text-text hover:bg-raised";
export const chipOn = "border-brand bg-brand text-bg";

const cardLink =
  "flex h-full min-w-0 flex-col gap-2 border-2 border-border bg-surface p-4 shadow-block-card hover:bg-raised md:p-5";

// O índice fica em /wiki-index.json (gerado no build) e é baixado uma vez, no primeiro foco da busca ou uso de filtro.
let indexCache: WikiIndexItem[] | null = null;

export function WikiExplorer({ categories }: { categories: CategoryCard[] }) {
  const { query, category, status, setQuery, setCategory, setStatus, clear } = useWikiFilters();
  const active = query.trim() !== "" || category !== null || status !== null;
  const [index, setIndex] = useState<WikiIndexItem[] | null>(indexCache);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    if (indexCache) return;
    fetch(asset("/wiki-index.json"))
      .then((r) => (r.ok ? (r.json() as Promise<WikiIndexItem[]>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        indexCache = data;
        setFailed(false);
        setIndex(data);
      })
      .catch(() => setFailed(true));
  }, []);

  // Filtros guardados de uma visita anterior também precisam do índice.
  useEffect(() => {
    if (active) load();
  }, [active, load]);

  const results = useMemo(() => {
    if (!index) return [];
    const terms = fold(query).split(/\s+/).filter(Boolean);
    return index.filter(
      (p) =>
        (category === null || p.category === category) &&
        (status === null || p.status === status) &&
        terms.every((t) => p.search.includes(t)),
    );
  }, [index, query, category, status]);

  return (
    <div className="flex flex-col gap-8">
      <search className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="wiki-busca" className="mb-2 block font-display font-semibold">
            Buscar na wiki
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-3 size-5 text-muted-foreground" />
          <input
            id="wiki-busca"
            type="search"
            value={query}
            onFocus={load}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busque por raça, ataque, planeta…"
            autoComplete="off"
            className="min-h-12 w-full min-w-0 border-2 border-border bg-surface pr-4 pl-10 text-text placeholder:text-muted-foreground"
          />
        </div>

        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-1 font-display text-sm font-semibold text-muted-foreground">Categoria</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={category === null} onClick={() => { load(); setCategory(null); }} className={cn(chip, category === null ? chipOn : chipOff)}>
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => { load(); setCategory(category === c.slug ? null : c.slug); }}
                className={cn(chip, category === c.slug ? chipOn : chipOff)}
              >
                {c.title}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-1 font-display text-sm font-semibold text-muted-foreground">Filtrar por status</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={status === null} onClick={() => { load(); setStatus(null); }} className={cn(chip, status === null ? chipOn : chipOff)}>
              Todos
            </button>
            {wikiStatuses.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => { load(); setStatus(status === s ? null : s); }}
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

      {active ? (
        <section aria-labelledby="resultados" className="flex flex-col gap-4">
          <h2 id="resultados">Resultados</h2>
          <p role="status" className="text-muted-foreground">
            {failed
              ? "Não foi possível carregar a busca."
              : !index
                ? "Carregando a busca…"
                : results.length === 1
                  ? "1 resultado encontrado"
                  : `${results.length} resultados encontrados`}
          </p>
          {failed ? (
            <button type="button" onClick={() => { setFailed(false); load(); }} className={cn(chip, chipOff, "w-fit")}>
              Tentar novamente
            </button>
          ) : !index ? null : results.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 nav:gap-6">
              {results.map((p) => (
                <li key={`${p.category}/${p.slug}`} className="min-w-0">
                  <Link href={`/wiki/${p.category}/${p.slug}`} className={cardLink}>
                    <span className="text-sm text-muted-foreground">{p.categoryTitle}</span>
                    <span className="font-display text-lg font-semibold [overflow-wrap:anywhere]">{p.title}</span>
                    <span className="text-sm text-muted-foreground">{p.description}</span>
                    <span className="mt-auto pt-1"><WikiStatusBadge status={p.status} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 border-2 border-dashed border-border bg-surface p-6">
              <p className="font-display text-lg font-semibold">Nenhuma página encontrada</p>
              <p className="text-muted-foreground [overflow-wrap:anywhere]">
                {query.trim() ? `Não achamos nada para “${query.trim()}”. ` : "Não achamos nada com esses filtros. "}
                Tente outra palavra ou limpe os filtros.
              </p>
              <p className="font-display font-semibold">Não achou? Pergunte no Discord. Sentiu falta de algo? Conte para a equipe no Discord.</p>
              <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="categorias" className="flex flex-col gap-4">
          <h2 id="categorias">Categorias</h2>
          <ul className="grid gap-4 md:grid-cols-2 nav:grid-cols-3 nav:gap-6">
            {categories.map((c) => (
              <li key={c.slug} className="min-w-0">
                <Link href={`/wiki/${c.slug}`} className={cardLink}>
                  <span className="font-display text-lg font-semibold [overflow-wrap:anywhere]">{c.title}</span>
                  {c.description && <span className="text-sm text-muted-foreground">{c.description}</span>}
                  <span className="mt-auto pt-1 text-sm text-brand">
                    {c.count === 0 ? "Em breve" : c.count === 1 ? "1 página" : `${c.count} páginas`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

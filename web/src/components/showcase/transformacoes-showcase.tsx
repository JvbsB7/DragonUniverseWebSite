"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge, type Status } from "@/components/status-badge";
import { MotionRoot, PainelAnimado } from "@/components/motion-lazy";
import { prefetchFor } from "@/lib/prefetch";
import { cn } from "@/lib/utils";

export type TransformacaoItem = {
  slug: string;
  titulo: string;
  status: Extract<Status, "live" | "dev" | "planned">;
  resumo: string;
  quemUsa: string | null;
  href: string;
};

const statusTexto: Record<TransformacaoItem["status"], string> = {
  live: "já no jogo, na versão de teste",
  dev: "em desenvolvimento, ainda não está no add-on",
  planned: "planejado, sem data",
};
const statusLabel: Record<TransformacaoItem["status"], string> = { live: "Já no jogo", dev: "Em desenvolvimento", planned: "Planejado" };

function Detalhe({ item }: { item: TransformacaoItem }) {
  return (
    <div className="grid min-w-0 content-start gap-3">
      <StatusBadge status={item.status} />
      <h3 className="text-card-title">{item.titulo}</h3>
      <section aria-label="O que é" className="grid gap-1">
        <h4 className="font-game text-sm font-semibold text-muted-foreground">O que é</h4>
        <p className="max-w-[65ch]">{item.resumo}</p>
      </section>
      {item.quemUsa && (
        <section aria-label="Quem usa" className="grid gap-1">
          <h4 className="font-game text-sm font-semibold text-muted-foreground">Quem usa</h4>
          <p className="max-w-[65ch]">{item.quemUsa}</p>
        </section>
      )}
      <section aria-label="Status" className="grid gap-1">
        <h4 className="font-game text-sm font-semibold text-muted-foreground">Status</h4>
        <p className="max-w-[65ch]">{statusLabel[item.status]}. {item.status === "live" ? "Está na versão de teste 1.7.1E." : item.status === "dev" ? "Ainda não está no add-on." : "Sem data e sem promessa de entrega."}</p>
      </section>
      <div>
        <Link
          href={item.href}
          prefetch={prefetchFor(item.href)}
          className="inline-flex min-h-12 items-center text-base font-semibold text-brand underline underline-offset-4"
        >
          Ver página completa<span className="sr-only">: {item.titulo}</span>
        </Link>
      </div>
    </div>
  );
}

// Vitrine de transformações (v3-04-design.md §9.3; copy §6 e A.6): seletor à esquerda e painel à direita (1100 px+), seletor em
// linhas que quebram e painel abaixo no celular. A seleção é por botão (teclado e toque), sem arrastar; o foco fica no
// seletor e um texto discreto anuncia a troca. "Comparar" admite até 2 itens e só mostra campos com dado. Sem print real,
// o painel mostra "Imagem em breve" uma única vez; nenhuma linha de progressão é inventada.
export function TransformacoesShowcase({ itens, nivelTitulo = 3 }: { itens: TransformacaoItem[]; nivelTitulo?: 2 | 3 }) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h3";
  const [atual, setAtual] = useState(itens[0].slug);
  const [trocou, setTrocou] = useState(false);
  const [comparar, setComparar] = useState(false);
  const [par, setPar] = useState<string[]>([]);

  const item = itens.find((i) => i.slug === atual) ?? itens[0];
  const escolhidos = par.map((s) => itens.find((i) => i.slug === s)).filter((x): x is TransformacaoItem => !!x);

  const escolher = (slug: string) => {
    setTrocou(true);
    if (comparar) {
      setPar((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= 2 ? [p[1], slug] : [...p, slug]));
    } else setAtual(slug);
  };
  const alternarComparar = () => {
    setTrocou(true);
    setComparar((c) => {
      if (!c) setPar([atual]);
      return !c;
    });
  };

  const selecionado = (slug: string) => (comparar ? par.includes(slug) : slug === atual);
  const anuncio = comparar
    ? `Comparando ${escolhidos.map((e) => e.titulo).join(" e ") || "nenhuma transformação"}.`
    : `Mostrando ${item.titulo}. Status: ${statusLabel[item.status].toLowerCase()}.`;

  return (
    <MotionRoot>
      <div className="grid gap-6 nav:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] nav:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Titulo id="lista-transformacoes" className="text-xl">Escolha uma transformação</Titulo>
            <button
              type="button"
              aria-pressed={comparar}
              onClick={alternarComparar}
              className={cn(
                "inline-flex min-h-12 items-center rounded-md border px-4 text-base font-semibold",
                comparar ? "border-brand bg-brand text-bg" : "border-border bg-surface text-text hover:bg-raised",
              )}
            >
              Comparar
            </button>
          </div>
          {comparar && <p className="mt-2 text-sm text-muted-foreground">Escolha até 2 transformações</p>}
          <ul aria-labelledby="lista-transformacoes" aria-label="Lista de transformações" className="mt-3 flex flex-wrap gap-2 nav:grid">
            {itens.map((i) => (
              <li key={i.slug} className="min-w-0 nav:w-full">
                <button
                  type="button"
                  aria-pressed={selecionado(i.slug)}
                  onClick={() => escolher(i.slug)}
                  className={cn(
                    "flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 text-start text-base font-semibold",
                    selecionado(i.slug) ? "border-brand bg-raised text-text shadow-[inset_4px_0_0_var(--du-brand)]" : "border-border bg-surface text-text hover:bg-raised",
                  )}
                >
                  <span className="min-w-0">{i.titulo}</span>
                  <span className="shrink-0 text-sm font-normal text-muted-foreground">{statusLabel[i.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-xl border border-edge bg-surface p-5 shadow-block-card md:p-6">
          <p className="sr-only" aria-live="polite">{anuncio}</p>
          <PainelAnimado chave={comparar ? par.join("+") : item.slug} trocou={trocou}>
            {comparar ? (
              <div className="grid gap-6 md:grid-cols-2">
                {escolhidos.length === 0 && <p>Escolha até 2 transformações na lista para comparar.</p>}
                {escolhidos.map((e) => (
                  <Detalhe key={e.slug} item={e} />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
                <Detalhe item={item} />
                <div
                  aria-hidden="true"
                  className="hidden min-h-40 place-items-center self-start rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground md:grid"
                >
                  Imagem em breve
                </div>
              </div>
            )}
          </PainelAnimado>
          <p className="mt-4 text-sm text-muted-foreground">Cada página diz se aquilo já está no jogo, está em desenvolvimento ou está planejado.</p>
        </div>
      </div>
    </MotionRoot>
  );
}

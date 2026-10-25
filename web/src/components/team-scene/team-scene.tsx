"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CinemaView } from "@/components/cinema/cinema-view";
import { GithubMark } from "@/components/github-mark";
import { SkinFace } from "@/components/skin-viewer/skin-face";
import { buttonClass } from "@/components/button";
import { equipe, ordemDaVitrine, tituloDaPessoa, type IdDaPessoa, type PessoaDaEquipe } from "@/config/equipe";
import { asset, assetSet } from "@/lib/asset";
import { cn } from "@/lib/utils";
import { useEquipeStore } from "@/store/equipe";

// Vitrine da equipe (v4-03 §7; copy v4-04 §3). Desktop: cena 3D no canvas cinema + seletores + painel. Celular: cartões
// deslizáveis sem WebGL. Os dados vêm só de config/equipe.ts. Os controles são HTML e nunca ficam dentro da cena (role="img").
const CenaEquipe = dynamic(() => import("./cena-equipe"), { ssr: false });

const energias: Record<IdDaPessoa, string> = { joao: "var(--du-energy-brand)", ricardo: "var(--du-energy-god)", luan: "var(--du-energy-golden)" };
const pessoas = ordemDaVitrine.map((id) => equipe.find((p) => p.id === id)!);
const rotuloCurto = (p: PessoaDaEquipe) => p.jogador ?? p.nome;
const descricaoDaCena =
  "Cena da equipe: JvbsBR à esquerda, Luan Dias flutuando de braços cruzados ao centro e rvmm255 à direita. Escolha uma pessoa para ver o perfil.";

function Painel({ id }: { id: IdDaPessoa | null }) {
  const fechar = useEquipeStore((s) => s.fechar);
  const pessoa = pessoas.find((p) => p.id === id);
  if (!pessoa) {
    return (
      <div className="rounded-xl border border-edge bg-surface p-5 md:p-6">
        <p className="text-muted-foreground">Escolha uma pessoa para ver o perfil.</p>
      </div>
    );
  }
  const titulo = tituloDaPessoa(pessoa);
  return (
    <section aria-label={`Perfil de ${pessoa.nome}${pessoa.jogador ? `, ${pessoa.jogador}` : ""}`} className="rounded-xl border border-edge bg-surface shadow-block-card">
      <div aria-hidden="true" className="h-3 rounded-t-xl" style={{ background: energias[pessoa.id] }} />
      <div className="grid gap-3 p-5 md:p-6">
        <h3 className="text-2xl [overflow-wrap:anywhere]">{titulo}</h3>
        <dl className="grid gap-3">
          <div>
            <dt className="text-sm text-muted-foreground">Função na equipe</dt>
            <dd>{pessoa.texto}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Discord</dt>
            <dd className="font-display text-brand">{pessoa.discord}</dd>
          </div>
        </dl>
        <a
          href={pessoa.github.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub de ${pessoa.nome}, abre em nova aba`}
          className="inline-flex min-h-12 w-fit max-w-full items-center gap-2 text-brand underline underline-offset-4 [overflow-wrap:anywhere]"
        >
          <GithubMark />
          <span>GitHub: {pessoa.github.rotulo}</span>
        </a>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={fechar} className={buttonClass("secondary")}>
            Fechar perfil
          </button>
          <button type="button" onClick={fechar} className={buttonClass("secondary")}>
            Ver a equipe toda
          </button>
        </div>
      </div>
    </section>
  );
}

function Seletor({ pessoa, selecionada }: { pessoa: PessoaDaEquipe; selecionada: boolean }) {
  const selecionar = useEquipeStore((s) => s.selecionar);
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      aria-label={`Ver perfil de ${pessoa.nome}${pessoa.jogador ? `, ${pessoa.jogador}` : ""}`}
      onClick={() => selecionar(pessoa.id, pessoa.nome)}
      className={cn(
        "grid min-h-12 min-w-0 justify-items-center gap-2 rounded-md border bg-surface px-2 py-2 text-center font-display text-lg font-bold [overflow-wrap:anywhere] md:text-xl",
        selecionada ? "border-brand outline-2 outline-offset-0 outline-brand" : "border-edge",
      )}
    >
      <span>{rotuloCurto(pessoa)}</span>
      <span aria-hidden="true" className="block h-1 w-full max-w-16" style={{ background: energias[pessoa.id] }} />
      {selecionada && <span className="sr-only"> (selecionado)</span>}
    </button>
  );
}

// Zonas de clique sobre cada personagem: atalho do mouse para os mesmos seletores (os botões acima são o acesso real).
const zonas: Record<IdDaPessoa, string> = { joao: "left-[12%]", luan: "left-[38%]", ricardo: "left-[64%]" };

function Desktop({ selecionada }: { selecionada: IdDaPessoa | null }) {
  const selecionar = useEquipeStore((s) => s.selecionar);
  return (
    <div className="hidden md:block">
      <p className="mb-3 text-muted-foreground">Escolha uma pessoa para ver o perfil.</p>
      <div className="grid items-start gap-6 nav:grid-cols-[minmax(0,744fr)_minmax(0,384fr)]">
        <div className="min-w-0">
          <div className="relative">
            <CinemaView
              className="relative aspect-[744/420] w-full overflow-hidden rounded-xl border border-edge bg-bg bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_srgb,var(--du-brand-decor)_45%,transparent)_0%,transparent_70%)]"
              mundo={{ largura: 744, altura: 420 }}
              cameraPropria
              fallback={
                <div className="absolute inset-0 flex items-center justify-center gap-6 md:gap-12">
                  {pessoas.map((m) => (
                    <SkinFace
                      key={m.skin}
                      src={m.skin}
                      className={cn("aspect-square w-1/4 max-w-28 transition-transform", selecionada === m.id && "scale-110 outline-2 outline-offset-4 outline-brand")}
                    />
                  ))}
                </div>
              }
              cena={(aoPronto, visivel) => <CenaEquipe aoPronto={aoPronto} visivel={visivel} />}
            />
            {pessoas.map((p) => (
              <div
                key={p.id}
                aria-hidden="true"
                onClick={() => selecionar(p.id, p.nome)}
                className={cn("absolute top-[8%] h-[88%] w-[24%] cursor-pointer", zonas[p.id])}
              />
            ))}
          </div>
          <p className="sr-only">{descricaoDaCena}</p>
          <div role="group" aria-label="Escolha uma pessoa da equipe" className="mt-4 grid grid-cols-3 gap-3">
            {pessoas.map((p) => (
              <Seletor key={p.id} pessoa={p} selecionada={selecionada === p.id} />
            ))}
          </div>
        </div>
        <Painel id={selecionada} />
      </div>
    </div>
  );
}

function Celular({ selecionada }: { selecionada: IdDaPessoa | null }) {
  const selecionar = useEquipeStore((s) => s.selecionar);
  const trilho = useRef<HTMLUListElement>(null);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setIndice(Number((e.target as HTMLElement).dataset.i))),
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  const ir = (i: number) => {
    const el = trilho.current;
    const alvo = el?.children[Math.min(2, Math.max(0, i))] as HTMLElement | undefined;
    if (!el || !alvo) return;
    const reduz = document.documentElement.dataset.reduzir === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: alvo.offsetLeft - el.offsetLeft - 9, behavior: reduz ? "auto" : "smooth" });
  };

  return (
    <div className="md:hidden">
      <p className="mb-3 text-muted-foreground">Deslize e toque em uma pessoa para ver o perfil.</p>
      <ul ref={trilho} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[9px] py-[9px] [scrollbar-width:thin]">
        {pessoas.map((p, i) => (
          <li
            key={p.id}
            data-i={i}
            aria-label={`Pessoa ${i + 1} de 3`}
            className="w-[18.5rem] max-w-[calc(100vw-4rem)] shrink-0 snap-start rounded-xl border border-edge bg-surface shadow-block-card"
          >
            <div aria-hidden="true" className="h-3 rounded-t-xl" style={{ background: energias[p.id] }} />
            <div className="grid justify-items-center gap-3 p-4">
              <div className="cartao-halo relative w-full overflow-hidden rounded-md bg-surface" data-selecionada={selecionada === p.id || undefined} style={{ ["--halo" as string]: energias[p.id] }}>
                {/* Pôster de corpo inteiro da Forja (3:4, sobre a cor do cartão); o halo é só CSS e para com o movimento reduzido. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(`${p.preview.base}-corpo-1x-fundo.webp`)}
                  srcSet={assetSet(`${p.preview.base}-corpo-1x-fundo.webp 296w, ${p.preview.base}-corpo-2x-fundo.webp 592w`)}
                  sizes="264px"
                  width={p.preview.width}
                  height={p.preview.height}
                  alt={p.alt}
                  loading="lazy"
                  className="relative block h-auto w-full"
                />
              </div>
              <p className="font-display text-xl font-bold [overflow-wrap:anywhere]">{tituloDaPessoa(p)}</p>
              <button
                type="button"
                aria-pressed={selecionada === p.id}
                aria-label={`Ver perfil de ${p.nome}${p.jogador ? `, ${p.jogador}` : ""}`}
                onClick={() => selecionar(p.id, p.nome)}
                className={buttonClass(selecionada === p.id ? "primary" : "secondary")}
              >
                Ver perfil
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => ir(indice - 1)} aria-disabled={indice === 0} className={buttonClass("secondary")}>
          Anterior<span className="sr-only"> pessoa</span>
        </button>
        <p aria-label={`Pessoa ${indice + 1} de 3`} className="font-display font-semibold whitespace-nowrap">
          {indice + 1} de 3
        </p>
        <button type="button" onClick={() => ir(indice + 1)} aria-disabled={indice === 2} className={buttonClass("secondary")}>
          Próxima<span className="sr-only"> pessoa</span>
        </button>
      </div>
      <div className="mt-4">
        <Painel id={selecionada} />
      </div>
    </div>
  );
}

export function TeamScene({ className }: { className?: string }) {
  const selecionada = useEquipeStore((s) => s.selecionada);
  const anuncio = useEquipeStore((s) => s.anuncio);
  return (
    <div className={cn("mx-auto w-full max-w-[72rem]", className)}>
      <Desktop selecionada={selecionada} />
      <Celular selecionada={selecionada} />
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}

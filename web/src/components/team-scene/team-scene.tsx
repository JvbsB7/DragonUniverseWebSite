"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CinemaView } from "@/components/cinema/cinema-view";
import { FaixaNuvem } from "@/components/nuvem/faixa-nuvem";
import { ReflexoBorda } from "@/components/reflexo-borda";
import { GithubMark } from "@/components/github-mark";
import { buttonClass } from "@/components/button";
import { FalaSlot } from "@/components/fala/balao";
import { equipe, ordemDaVitrine, tituloDaPessoa, type IdDaPessoa, type PessoaDaEquipe } from "@/config/equipe";
import { FALAS_DA_VITRINE, LOCUTOR } from "@/config/falas";
import { asset, assetSet } from "@/lib/asset";
import { useReduzir } from "@/lib/use-qualidade";
import { cn } from "@/lib/utils";
import { useEquipeStore } from "@/store/equipe";
import { selecoes, useFalaStore } from "@/store/fala";

// Vitrine da equipe (v4-03 §7; copy v4-04 §3). Desktop: cena 3D no canvas cinema + seletores + painel. Celular: cartões
// deslizáveis sem WebGL. Os dados vêm só de config/equipe.ts. Os controles são HTML e nunca ficam dentro da cena (role="img").
const CenaEquipe = dynamic(() => import("./cena-equipe"), { ssr: false });

const energias: Record<IdDaPessoa, string> = { joao: "var(--du-aura-jvbsbr-brilho)", ricardo: "var(--du-aura-rvmm255-brilho)", luan: "var(--du-aura-luan-brilho)" };
const pessoas = ordemDaVitrine.map((id) => equipe.find((p) => p.id === id)!);
const rotuloCurto = (p: PessoaDaEquipe) => p.jogador ?? p.nome;
const descricaoDaCena =
  "Cena da equipe: JvbsBR à esquerda, Luan Dias flutuando de braços cruzados ao centro e rvmm255 à direita. Escolha uma pessoa para ver o perfil.";

type Titulo = "h2" | "h3";

function Painel({ id, titulo: Titulo = "h3" }: { id: IdDaPessoa | null; titulo?: Titulo }) {
  const fecharStore = useEquipeStore((s) => s.fechar);
  // Ao fechar, o foco volta ao botão que seleciona a pessoa (o visível: seletor no desktop, "Ver perfil" no celular).
  const fechar = () => {
    fecharStore();
    requestAnimationFrame(() => {
      const alvo = [...document.querySelectorAll<HTMLElement>(`[data-seletor="${id}"]`)].find((el) => el.offsetParent !== null);
      alvo?.focus();
    });
  };
  const pessoa = pessoas.find((p) => p.id === id);
  if (!pessoa) {
    return (
      <div className="rounded-xl border border-edge bg-surface p-5 md:p-6">
        <p className="text-muted-foreground">Escolha uma pessoa para ver o perfil.</p>
      </div>
    );
  }
  return (
    <section aria-label={`Perfil de ${pessoa.nome}${pessoa.jogador ? `, ${pessoa.jogador}` : ""}`} className="rounded-xl border border-edge bg-surface shadow-block-card">
      <div aria-hidden="true" className="h-3 rounded-t-xl" style={{ background: energias[pessoa.id] }} />
      <div className="grid gap-3 p-5 md:p-6">
        <Titulo className="text-2xl [overflow-wrap:anywhere]">{tituloDaPessoa(pessoa)}</Titulo>
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
          aria-label={`GitHub: ${pessoa.github.rotulo}, de ${pessoa.nome}, abre em nova aba`}
          className="inline-flex min-h-12 w-fit max-w-full items-center gap-2 text-brand underline underline-offset-4 [overflow-wrap:anywhere]"
        >
          <GithubMark />
          <span>GitHub: {pessoa.github.rotulo}</span>
        </a>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={fechar} className={buttonClass("secondary")}>
            Fechar perfil
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
      data-seletor={pessoa.id}
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

function Desktop({ selecionada, titulo }: { selecionada: IdDaPessoa | null; titulo: Titulo }) {
  const selecionar = useEquipeStore((s) => s.selecionar);
  return (
    <div className="hidden md:block">
      <p className="mb-3 text-muted-foreground">Escolha uma pessoa para ver o perfil.</p>
      <div className="grid items-start gap-6 nav:grid-cols-[minmax(0,744fr)_minmax(0,384fr)]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-xl">
            <ReflexoBorda id="equipe" />
            <CinemaView
              className="ambiente-palco relative aspect-[744/420] w-full overflow-hidden rounded-xl border border-edge bg-bg"
              mundo={{ largura: 744, altura: 420 }}
              cameraPropria
              fallback={
                // Sem 3D: os corpos inteiros (os mesmos pôsteres do celular), lado a lado; a seleção só realça o contorno.
                <div className="absolute inset-0 flex items-center justify-center gap-3 md:gap-6">
                  {pessoas.map((m) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={m.id}
                      src={asset(`${m.preview.base}-corpo-1x-fundo.webp`)}
                      srcSet={assetSet(`${m.preview.base}-corpo-1x-fundo.webp 296w, ${m.preview.base}-corpo-2x-fundo.webp 592w`)}
                      sizes="(min-width: 768px) 240px, 30vw"
                      width={m.preview.width}
                      height={m.preview.height}
                      alt=""
                      loading="lazy"
                      className={cn("aspect-[3/4] h-[78%] w-auto rounded-md transition-transform", selecionada === m.id && "scale-105 outline-2 outline-offset-4 outline-brand")}
                    />
                  ))}
                </div>
              }
              cena={(aoPronto, visivel) => <CenaEquipe aoPronto={aoPronto} visivel={visivel} />}
            />
            {/* Balão da fala (D29): dentro do palco, acima da pessoa (cauda para baixo) ou ao lado do Luan; nunca sobre os seletores. */}
            <FalaSlot
              contexto="vitrine"
              apontar={selecionada === "luan" ? "direita" : "baixo"}
              className={cn(
                "pointer-events-none absolute z-10 [&>div]:pointer-events-auto",
                // Larguras que mantêm o balão longe do Luan (centro do palco): quebra em duas ou três linhas se preciso.
                selecionada === "joao" && "bottom-[62%] left-[14%] w-[17rem] [--cauda-x:134px]",
                selecionada === "ricardo" && "bottom-[62%] right-[18%] w-[13rem] [--cauda-x:85px]",
                selecionada === "luan" && "right-[58%] top-[8%]",
              )}
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
        <Painel id={selecionada} titulo={titulo} />
      </div>
    </div>
  );
}

function Celular({ selecionada, titulo }: { selecionada: IdDaPessoa | null; titulo: Titulo }) {
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
                data-seletor={p.id}
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
      <FalaSlot contexto="vitrine" className="mt-1 min-h-[7.5rem]" />
      <div className="mt-4">
        <Painel id={selecionada} titulo={titulo} />
      </div>
    </div>
  );
}

/** `titulo`: nível do título do perfil (h2 na página da equipe, onde a seção não tem título próprio; h3 na Home). */
export function TeamScene({ className, titulo = "h3" }: { className?: string; titulo?: Titulo }) {
  const selecionada = useEquipeStore((s) => s.selecionada);
  const anuncio = useEquipeStore((s) => s.anuncio);
  const { reduzir, sistema } = useReduzir();
  const reduzido = reduzir || sistema;

  // Fala da pessoa selecionada (D34): depois da pose curta (≈ 450 ms; imediata com redução), alternando o grito do golpe e a frase.
  // Fechar o perfil encerra a fala. Fica aqui, uma só vez, e não nas duas versões (desktop e celular) da vitrine.
  useEffect(() => {
    if (!selecionada) {
      useFalaStore.getState().fechar("vitrine");
      return;
    }
    if (reduzido) return; // D39: sem balão com movimento reduzido
    const t = window.setTimeout(
      () => {
        const textos = FALAS_DA_VITRINE[selecionada];
        const n = selecoes[selecionada] ?? 0;
        selecoes[selecionada] = n + 1;
        useFalaStore.getState().falar({ contexto: "vitrine", ...LOCUTOR[selecionada], texto: textos[n % textos.length], acao: true });
      },
      450,
    );
    return () => clearTimeout(t);
  }, [selecionada, reduzido]);

  return (
    <div className={cn("mx-auto w-full max-w-[72rem]", className)}>
      <Desktop selecionada={selecionada} titulo={titulo} />
      <Celular selecionada={selecionada} titulo={titulo} />
      <FaixaNuvem id="equipe" className="mt-6" />
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}

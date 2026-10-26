"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StatusBadge, type Status } from "@/components/status-badge";
import { MotionRoot, PainelAnimado } from "@/components/motion-lazy";
import { asset, assetSet } from "@/lib/asset";
import { cn } from "@/lib/utils";
import { FaixaNuvem } from "@/components/nuvem/faixa-nuvem";
import { ocuparNuvem } from "@/store/nuvem";
import { useQualidade } from "@/lib/use-qualidade";
import { avisoUniverso, comoChegar, type Destino, type DestinoStatus } from "@/config/universo";

const statusMap: Record<DestinoStatus, Status> = { live: "live", preview: "preview", planned: "planned" };
const filtros: { id: "todos" | DestinoStatus; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "live", rotulo: "Já no jogo" },
  { id: "preview", rotulo: "Em desenvolvimento · Prévia" },
  { id: "planned", rotulo: "Planejado" },
];

// Faixa de viagem (v4-03 §11.2): área gráfica separada da imagem (nunca cobre a construção), com altura reservada (72 px no
// desktop, 48 px no celular). A nave autoral (sprite aprovado, 4 quadros de rastro) a cruza em 650 ms / 400 ms. Decorativa.
function Faixa({ viagem, aoPular }: { viagem: { nome: string } | null; aoPular: () => void }) {
  return (
    <div
      aria-hidden={viagem ? undefined : true}
      style={{ ["--nave-1x" as string]: `url(${asset("/img/nave/nave-1x.webp")})`, ["--nave-2x" as string]: `url(${asset("/img/nave/nave-2x.webp")})` }}
      className="faixa-viagem relative h-12 overflow-hidden rounded-md border border-edge bg-bg nav:h-[4.5rem]">
      {viagem && (
        <>
          <span aria-hidden="true" className="nave-voo absolute top-1/2 -translate-y-1/2">
            <span className="nave-sprite block" />
          </span>
          <span aria-hidden="true" className="absolute start-3 top-1 text-xs text-muted-foreground">
            A caminho de {viagem.nome}…
          </span>
          <button type="button" onClick={aoPular} className="absolute end-1 top-1/2 inline-flex min-h-12 -translate-y-1/2 items-center rounded-md px-3 text-sm font-semibold text-brand underline underline-offset-4">
            Pular a viagem
          </button>
        </>
      )}
    </div>
  );
}

function Painel({ d, viagem, aoPular }: { d: Destino; viagem: { nome: string } | null; aoPular: () => void }) {
  const wiki = `/wiki/planetas-e-dimensoes/${d.slug}`;
  return (
    <div className="grid min-w-0 content-start gap-3">
      <StatusBadge status={statusMap[d.status]} />
      <Faixa viagem={viagem} aoPular={aoPular} />
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
      <FaixaNuvem id="universo" />
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
export function UniversoShowcase({ destinos, nivelTitulo = 3 }: { destinos: Destino[]; nivelTitulo?: 2 | 3 }) {
  const [filtro, setFiltro] = useState<"todos" | DestinoStatus>("todos");
  const [atual, setAtual] = useState(destinos[0].slug);
  const [trocou, setTrocou] = useState(false);
  const [viagem, setViagem] = useState<{ nome: string } | null>(null);
  const [avisoViagem, setAvisoViagem] = useState("");
  const [ultimaAcao, setUltimaAcao] = useState<"filtro" | "destino">("filtro");
  const timer = useRef(0);
  const animar = useQualidade() !== "estatico";
  useEffect(() => () => clearTimeout(timer.current), []);

  // Viagem: os dados e a seleção mudam no início; a nave só cruza a faixa. Em cliques seguidos vale só o último destino.
  const viajar = (x: Destino) => {
    setTrocou(true);
    setUltimaAcao("destino");
    ocuparNuvem(2500);
    if (x.slug === atual) return;
    setAtual(x.slug);
    clearTimeout(timer.current);
    if (!animar) {
      setViagem(null);
      return;
    }
    const dur = window.matchMedia("(min-width: 1100px)").matches ? 650 : 400;
    setViagem({ nome: x.nome });
    setAvisoViagem("");
    timer.current = window.setTimeout(() => {
      setViagem(null);
      setAvisoViagem(`Chegamos a ${x.nome}.`);
    }, dur);
  };
  const pularViagem = () => {
    clearTimeout(timer.current);
    setViagem(null);
    setAvisoViagem("Chegamos ao destino.");
  };
  // Esc pula a viagem (a travessia é curta demais para alcançar o botão com o teclado).
  useEffect(() => {
    if (!viagem) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && pularViagem();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [viagem]);

  const lista = destinos.filter((d) => filtro === "todos" || d.status === filtro);
  const d = lista.find((x) => x.slug === atual) ?? lista[0];

  return (
    <MotionRoot>
      <div className="grid gap-4">
        {nivelTitulo === 2 && <h2 className="sr-only">Destinos do universo</h2>}
        <div role="group" aria-label="Filtrar destinos por status" className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => {
                setTrocou(true);
                setUltimaAcao("filtro");
                setFiltro(f.id);
              }}
              className={cn(
                "inline-flex min-h-12 max-w-full items-center rounded-md border px-3 py-1 text-start text-base font-semibold [overflow-wrap:anywhere]",
                filtro === f.id ? "border-brand bg-brand text-bg" : "border-border bg-surface text-text hover:bg-raised",
              )}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{avisoViagem}</p>
        <p className="sr-only" aria-live="polite">{!trocou || (animar && ultimaAcao === "destino") ? "" : d ? `Mostrando ${d.nome}. ${lista.length} ${lista.length === 1 ? "destino" : "destinos"} na lista.` : "Nenhum destino neste filtro."}</p>
        <div className="grid gap-6 nav:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] nav:items-start">
          <ul aria-label="Destinos do universo" className="grid min-w-0 gap-2">
            {lista.map((x) => {
              const sel = x.slug === d?.slug;
              return (
                <li key={x.slug} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={sel}
                    onClick={() => viajar(x)}
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
                        <Painel d={x} viagem={viagem} aoPular={pularViagem} />
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
                <Painel d={d} viagem={viagem} aoPular={pularViagem} />
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

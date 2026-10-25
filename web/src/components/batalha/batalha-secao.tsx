"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CinemaView } from "@/components/cinema/cinema-view";
import { FaixaNuvem } from "@/components/nuvem/faixa-nuvem";
import { ReflexoBorda } from "@/components/reflexo-borda";
import { ReduzirAnimacoes } from "@/components/reduzir-animacoes";
import { buttonClass } from "@/components/button";
import { batalha } from "@/config/batalha";
import { asset, assetSet } from "@/lib/asset";
import { useQualidade } from "@/lib/use-qualidade";
import { reduzirAtivo } from "@/lib/perfil";
import { useBatalhaStore } from "@/store/batalha";

const CenaBatalha = dynamic(() => import("./cena-batalha"), { ssr: false });

// Seção da batalha (v4-03 §3 e §4; copy v4-04 §2.2, R1–R6). Pôster + descrição + controles HTML independem de 3D.
// Alto: a sequência toca sozinha uma vez quando a seção fica ≥ 50% visível (D16) e termina no repouso. Médio: pôster e
// "Ver a batalha". Baixo: clipe vertical da Forja (quando existir) ou só o pôster. Estático: pôster, descrição à vista e
// "Ler a descrição da cena". O início automático e o fim espontâneo não são anunciados; só ações do visitante.
const botao = (extra = "") => `${buttonClass("secondary")} aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${extra}`;

export function BatalhaSecao() {
  const nivel = useQualidade();
  const hidratado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { status, pausada, jaTocou, anuncio } = useBatalhaStore();
  const { iniciar, pausar, retomar, pular, terminou } = useBatalhaStore.getState();
  const palco = useRef<HTMLDivElement>(null);
  const descricao = useRef<HTMLParagraphElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [tocandoVideo, setTocandoVideo] = useState(false);
  const [videoJaTocou, setVideoJaTocou] = useState(false);
  const [aviso, setAviso] = useState("");

  const com3d = nivel === "alto" || nivel === "medio";
  const estatico = nivel === "estatico";
  const clipe = batalha.videoVertical;
  // Médio só liga o 3D depois do botão; alto sempre (e o início é automático).
  const habilitada = nivel === "alto" || (nivel === "medio" && status !== "parado");

  // Início automático no nível alto (D16): uma vez por visita, com a seção ≥ 50% visível. Sem anúncio.
  useEffect(() => {
    const el = palco.current;
    if (!el || nivel !== "alto") return;
    // O cabeçalho fixo cobre o topo da tela: os 50% de visibilidade descontam a altura dele (v4-10 B4).
    const topo = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--du-header-offset")) || 0;
    const io = new IntersectionObserver(
      ([e]) => {
        const s = useBatalhaStore.getState();
        if (e.isIntersecting && s.status === "parado" && !s.jaTocou) s.iniciar(false);
      },
      { threshold: 0.5, rootMargin: `-${Math.round(topo)}px 0px 0px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [nivel]);

  // Se o nível cair durante a cena (redução ligada, quadros lentos), encerra a sequência no repouso e avisa uma vez.
  const nivelAnterior = useRef(nivel);
  useEffect(() => {
    const antes = nivelAnterior.current;
    nivelAnterior.current = nivel;
    if (antes === nivel) return;
    if (!(nivel === "alto" || nivel === "medio") && useBatalhaStore.getState().status === "tocando") terminou();
    // O botão "Reduzir animações" já anuncia a própria mudança; aqui só entra a redução vinda do sistema ou da economia de dados.
    if (nivel === "estatico" && antes !== "estatico" && !reduzirAtivo()) setAviso("Animações reduzidas. O conteúdo é o mesmo.");
  }, [nivel, terminou]);

  const tocando = status === "tocando";
  const rotuloReplay = tocando ? "Batalha em andamento" : jaTocou || status === "repouso" ? "Rever a batalha" : "Ver a batalha";

  return (
    <section aria-labelledby="titulo-batalha" className="py-12 md:py-16">
      <div className="du-container">
        {/* Título aprovado pela Pena (v4-04 v4.3 §2.7): h2 só para leitor de tela, sem texto visível duplicado. */}
        <h2 id="titulo-batalha" className="sr-only">
          A equipe em ação
        </h2>
        <figure className="mx-auto w-full max-w-[72rem]">
          <div ref={palco} className="relative overflow-hidden rounded-xl">
            <ReflexoBorda id="batalha" />
            <CinemaView
              alt={status === "parado" || !com3d ? batalha.alt : batalha.ariaAnimada}
              className={`ambiente-palco relative w-full overflow-hidden rounded-xl border border-edge bg-bg ${!com3d && !estatico && clipe ? "mx-auto aspect-[3/4] max-w-[26rem]" : estatico && batalha.videoVertical ? "mx-auto aspect-[3/4] max-w-[26rem] md:aspect-[2/1] md:max-w-none" : "aspect-[2/1]"}`}
              mundo={{ largura: 2, altura: 1 }}
              cameraPropria
              habilitada={habilitada}
              fallback={
                !com3d && !estatico && clipe ? (
                  <video
                    ref={video}
                    muted
                    playsInline
                    preload="none"
                    poster={asset(clipe.poster)}
                    width={clipe.width}
                    height={clipe.height}
                    aria-label="Clipe curto da cena da equipe: JvbsBR e rvmm255 se enfrentam, e Luan Dias observa de cima. Decorativo."
                    className="absolute inset-0 h-full w-full object-cover"
                    onPlay={() => setTocandoVideo(true)}
                    onEnded={() => {
                      setTocandoVideo(false);
                      setVideoJaTocou(true);
                    }}
                  >
                    {/* MP4 primeiro (menor no Android/Chrome e nativo no Safari/iOS); WebM como reserva. */}
                    <source src={asset(clipe.mp4)} type="video/mp4" />
                    <source src={asset(clipe.webm)} type="video/webm" />
                  </video>
                ) : (
                  // Com animações reduzidas no celular entra o pôster VERTICAL (3:4), o mesmo quadro final do clipe; no desktop, o 2:1.
                  <picture>
                    {estatico && batalha.videoVertical && (
                      <source media="(max-width: 767px)" srcSet={asset(batalha.videoVertical.poster)} />
                    )}
                    <img
                      src={asset(batalha.poster.src)}
                      srcSet={assetSet(batalha.poster.srcSet)}
                      sizes="(min-width: 1216px) 1152px, calc(100vw - 32px)"
                      width={batalha.poster.width}
                      height={batalha.poster.height}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </picture>
                )
              }
              cena={(aoPronto, visivel) => <CenaBatalha aoPronto={aoPronto} visivel={visivel} />}
            />
          </div>
          <figcaption>
            <p ref={descricao} id="batalha-descricao" tabIndex={-1} className={estatico ? "mt-4 text-muted-foreground" : "sr-only"}>
              {batalha.alt} {batalha.descricao}
            </p>
          </figcaption>
        </figure>

        <FaixaNuvem id="batalha" className="mx-auto my-6 max-w-[72rem]" />

        {hidratado && (
          <div role="group" aria-label="Controles da cena" className="mx-auto mt-4 flex w-full max-w-[72rem] flex-wrap items-center gap-3">
            {com3d && (
              <>
                <button
                  type="button"
                  aria-disabled={tocando}
                  title="Toca a cena de novo, do início."
                  onClick={() => {
                    if (!tocando) iniciar(true);
                  }}
                  className={botao()}
                >
                  {rotuloReplay}
                </button>
                <button type="button" onClick={() => (pausada ? retomar() : pausar())} aria-disabled={status === "parado"} className={botao()}>
                  {pausada ? "Retomar cena" : "Pausar cena"}
                </button>
                <button type="button" aria-disabled={!tocando} onClick={() => tocando && pular()} className={botao()}>
                  Pular para o repouso
                </button>
              </>
            )}
            {!com3d && !estatico && clipe && (
              <button
                type="button"
                aria-disabled={tocandoVideo}
                onClick={() => {
                  const v = video.current;
                  if (!v || tocandoVideo) return;
                  v.currentTime = 0;
                  void v.play();
                  setAviso("Cena iniciada.");
                }}
                className={botao()}
              >
                {tocandoVideo ? "Batalha em andamento" : videoJaTocou ? "Rever a batalha" : "Ver a batalha"}
              </button>
            )}
            {estatico && (
              <button
                type="button"
                onClick={() => {
                  descricao.current?.focus();
                  setAviso("Descrição da cena.");
                }}
                className={botao()}
              >
                Ler a descrição da cena
              </button>
            )}
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {anuncio || aviso}
        </p>
        <div className="mx-auto mt-2 w-full max-w-[72rem]">{hidratado && <ReduzirAnimacoes id="reduzir-batalha" />}</div>
      </div>
    </section>
  );
}

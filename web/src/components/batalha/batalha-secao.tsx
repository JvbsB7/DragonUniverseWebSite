"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CinemaView } from "@/components/cinema/cinema-view";
import { FaixaNuvem } from "@/components/nuvem/faixa-nuvem";
import { ReflexoBorda } from "@/components/reflexo-borda";
import { FalaSlot } from "@/components/fala/balao";
import { ReduzirAnimacoes } from "@/components/reduzir-animacoes";
import { batalha } from "@/config/batalha";
import { asset, assetSet } from "@/lib/asset";
import { useQualidade } from "@/lib/use-qualidade";
import { FALAS_DO_REPOUSO, LOCUTOR } from "@/config/falas";
import { useFalaStore } from "@/store/fala";
import { reduzirAtivo } from "@/lib/perfil";
import { useBatalhaStore } from "@/store/batalha";

const CenaBatalha = dynamic(() => import("./cena-batalha"), { ssr: false });

// Seção da batalha (v4-03 §3 e §4; v4.2 D49–D51: sem botões). Pôster + descrição independem de 3D. A luta toca UMA vez por carregamento,
// sozinha, quando a seção fica ≥ 50% visível, e termina no repouso: alto e médio com a cena 3D, baixo/celular com o clipe vertical
// (mudo, sem controles), estático/movimento reduzido/economia de dados só com o pôster e a descrição em texto visível.
// Não há pausa, pulo, replay nem anúncio de controle; o "Reduzir animações" global (rodapé e menu) continua sendo o meio de parar tudo.
export function BatalhaSecao() {
  const nivel = useQualidade();
  const hidratado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const status = useBatalhaStore((s) => s.status);
  const { terminou } = useBatalhaStore.getState();
  const palco = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [aviso, setAviso] = useState("");

  const com3d = nivel === "alto" || nivel === "medio";
  const estatico = nivel === "estatico";
  const clipe = batalha.videoVertical;
  // O 3D do médio só é carregado quando a luta vai começar (≥ 50% visível); o alto liga logo. O início é automático nos dois.
  const habilitada = nivel === "alto" || (nivel === "medio" && status !== "parado");

  // Início automático nos níveis alto e médio (D50): uma vez por carregamento, com a seção ≥ 50% visível. Sem anúncio.
  useEffect(() => {
    const el = palco.current;
    if (!el || !(nivel === "alto" || nivel === "medio")) return;
    // O cabeçalho fixo cobre o topo da tela: os 50% de visibilidade descontam a altura dele (v4-10 B4).
    const topo = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--du-header-offset")) || 0;
    const io = new IntersectionObserver(
      ([e]) => {
        const s = useBatalhaStore.getState();
        if (e.isIntersecting && s.status === "parado" && !s.jaTocou) s.iniciar();
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

  // Baixo/celular (D50): o clipe vertical toca sozinho, mudo, UMA vez, quando ≥ 50% visível (o cabeçalho fixo não conta). Sai da tela:
  // pausa; volta a ficar visível antes do fim: continua de onde parou. Com economia de dados o nível é estático e o vídeo nem é pedido.
  const comVideo = !com3d && !estatico && !!clipe;
  useEffect(() => {
    const el = palco.current;
    const v = video.current;
    if (!comVideo || !el || !v) return;
    const topo = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--du-header-offset")) || 0;
    let acabou = false;
    const fim = () => (acabou = true);
    v.addEventListener("ended", fim);
    const io = new IntersectionObserver(
      ([e]) => {
        if (acabou) return;
        if (e.intersectionRatio >= 0.5) void v.play().catch(() => {});
        else if (e.intersectionRatio < 0.2) v.pause();
      },
      { threshold: [0, 0.2, 0.5], rootMargin: `-${Math.round(topo)}px 0px 0px 0px` },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      v.removeEventListener("ended", fim);
    };
  }, [comVideo]);

  // Fala do repouso (D34): uma por reprodução, em rodízio, só depois de a ação terminar (nunca no choque nem na revelação do Luan).
  // Automática e decorativa; sai quando a cena recomeça. Sem 3D (vídeo, pôster, movimento reduzido) não há balão.
  useEffect(() => {
    const fala = useFalaStore.getState();
    if (status === "tocando") fala.fechar("repouso");
    if (status !== "repouso" || !com3d) return;
    const { id, texto } = FALAS_DO_REPOUSO[(useBatalhaStore.getState().rodada - 1 + FALAS_DO_REPOUSO.length) % FALAS_DO_REPOUSO.length];
    const t = window.setTimeout(() => fala.falar({ contexto: "repouso", ...LOCUTOR[id], texto, acao: false }), 400);
    return () => clearTimeout(t);
  }, [status, com3d]);

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
            <p id="batalha-descricao" className={estatico ? "mt-4 text-muted-foreground" : "sr-only"}>
              {batalha.alt} {batalha.descricao}
            </p>
          </figcaption>
        </figure>

        {/* Faixa da fala: logo abaixo do palco, com a altura reservada desde o início. */}
        {com3d && <FalaSlot contexto="repouso" className="mx-auto mt-2 min-h-[7.5rem] max-w-[72rem]" />}

        <FaixaNuvem id="batalha" className="mx-auto my-6 max-w-[72rem]" />

        <p role="status" aria-live="polite" className="sr-only">
          {aviso}
        </p>
        <div className="mx-auto mt-2 w-full max-w-[72rem]">{hidratado && <ReduzirAnimacoes id="reduzir-batalha" />}</div>
      </div>
    </section>
  );
}

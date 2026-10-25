"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CinemaView } from "@/components/cinema/cinema-view";
import { ReduzirAnimacoes } from "@/components/reduzir-animacoes";
import { buttonClass } from "@/components/button";
import { batalha } from "@/config/batalha";
import { asset, assetSet } from "@/lib/asset";
import { useQualidade } from "@/lib/use-qualidade";
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
    const io = new IntersectionObserver(
      ([e]) => {
        const s = useBatalhaStore.getState();
        if (e.isIntersecting && s.status === "parado" && !s.jaTocou) s.iniciar(false);
      },
      { threshold: 0.5 },
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
    if (nivel === "estatico" && antes !== "estatico") setAviso("Animações reduzidas. O conteúdo é o mesmo.");
  }, [nivel, terminou]);

  const tocando = status === "tocando";
  const rotuloReplay = tocando ? "Batalha em andamento" : jaTocou || status === "repouso" ? "Rever a batalha" : "Ver a batalha";

  return (
    <section aria-labelledby="titulo-batalha" className="py-12 md:py-16">
      <div className="du-container">
        {/* Título provisório (só para leitor de tela): a Pena ainda não definiu o título visível desta seção. */}
        <h2 id="titulo-batalha" className="sr-only">
          Cena da equipe
        </h2>
        <figure className="mx-auto w-full max-w-[72rem]">
          <div ref={palco}>
            <CinemaView
              alt={status === "parado" ? batalha.alt : batalha.ariaAnimada}
              className={`relative w-full overflow-hidden rounded-xl border border-edge bg-bg bg-[linear-gradient(180deg,#060a16_0%,#0d1a36_55%,#122344_100%)] ${!com3d && !estatico && clipe ? "mx-auto aspect-[3/4] max-w-[26rem]" : "aspect-[2/1]"}`}
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
                    <source src={asset(clipe.webm)} type="video/webm" />
                    <source src={asset(clipe.mp4)} type="video/mp4" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset(batalha.poster.src)}
                    srcSet={assetSet(batalha.poster.srcSet)}
                    sizes="(min-width: 1216px) 1152px, calc(100vw - 32px)"
                    width={batalha.poster.width}
                    height={batalha.poster.height}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
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
        <div className="mx-auto mt-2 w-full max-w-[72rem]">{hidratado && <ReduzirAnimacoes />}</div>
      </div>
    </section>
  );
}

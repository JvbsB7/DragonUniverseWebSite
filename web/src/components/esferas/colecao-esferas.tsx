"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/button";
import { FalaSlot } from "@/components/fala/balao";
import { FALA_DO_DRAGAO } from "@/config/falas";
import { useFalaStore } from "@/store/fala";
import { Dragao } from "@/components/esferas/dragao";
import { useReduzir } from "@/lib/use-qualidade";
import { ESFERAS, useEsferasStore } from "@/store/esferas";

// Área da coleção no fim da Home (v4-03 §9.3 e §9.4; copy v4-04 §4). Contador "n/7", aviso permanente, anúncios (aria-live),
// "Esconder as esferas de novo" com a explicação antes e o fechamento cosmético (sem dragão, sem tela inteira).
export function ColecaoEsferas() {
  const { coletadas, persistente, anuncio, fechamento, carregar, reiniciar } = useEsferasStore();
  const { reduzir, sistema } = useReduzir();
  const movimentoReduzido = reduzir || sistema;
  const painel = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(true);
  const [tocando, setTocando] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [pendente, setPendente] = useState(false);
  const total = coletadas.length;
  const completa = total === ESFERAS.length;
  useEffect(() => carregar(), [carregar]);

  useEffect(() => {
    const el = painel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A 7ª coleta ao vivo reabre o painel e toca o aro uma vez, só se o painel estiver à vista; senão fica "Rever a animação".
  const estado = useRef({ visivel: false, reduzido: false });
  useEffect(() => {
    estado.current = { visivel, reduzido: movimentoReduzido };
  }, [visivel, movimentoReduzido]);
  useEffect(
    () =>
      useEsferasStore.subscribe((s, anterior) => {
        if (s.fechamento === anterior.fechamento) return;
        setAberto(true);
        if (estado.current.reduzido) return;
        if (estado.current.visivel) setTocando(true);
        else setPendente(true);
      }),
    [],
  );

  // O dragão avisa quando termina (3,2 s no desktop, 2,4 s no celular); aí o quadro parado fica na tela.
  const terminou = useCallback(() => setTocando(false), []);

  // Fala do dragão (D34): automática e decorativa, quando ele já apareceu; fecha com o painel. Sem animação não há balão.
  useEffect(() => {
    const fala = useFalaStore.getState();
    if (!tocando || movimentoReduzido || !aberto) {
      if (!aberto) fala.fechar("dragao");
      return;
    }
    const celular = window.matchMedia("(max-width: 767px)").matches;
    const t = window.setTimeout(() => fala.falar({ contexto: "dragao", ...FALA_DO_DRAGAO, acao: false }), celular ? 1000 : 1400);
    return () => clearTimeout(t);
  }, [tocando, movimentoReduzido, aberto]);

  const rever = () => {
    setPendente(false);
    setTocando(false);
    requestAnimationFrame(() => setTocando(true));
  };

  return (
    <section id="colecao-esferas" aria-labelledby="titulo-esferas" className="bg-surface py-12 md:py-16">
      <div className="du-container grid gap-4" ref={painel}>
        <h2 id="titulo-esferas" tabIndex={-1} className="text-2xl">
          Esferas de energia
        </h2>
        <p aria-label={`Esferas de energia: ${total} de 7 coletadas`} className="font-display text-xl font-semibold">
          Esferas <span aria-hidden="true">{total}/7</span>
        </p>
        <p className="max-w-[65ch] text-muted-foreground">Enfeite do site. Sem relação com o apoio nem com o jogo.</p>
        {!persistente && <p className="max-w-[65ch] text-muted-foreground">Seu progresso vale só nesta visita.</p>}

        {completa && aberto && (
          <div className="grid max-w-md gap-3 rounded-xl border-2 border-[#f6b943] bg-bg p-5">
            <Dragao tocando={tocando && !movimentoReduzido} onFim={terminou} />
            {!movimentoReduzido && <FalaSlot contexto="dragao" className="min-h-[4.75rem]" />}
            <div aria-hidden="true" className="esferas-aro relative mx-auto h-24 w-24" data-tocando={tocando || undefined}>
              {ESFERAS.map((_, i) => (
                <i key={i} style={{ ["--i" as string]: i }} />
              ))}
            </div>
            <h3 className="text-xl">As 7 esferas se reuniram!</h3>
            <p>O dragão acordou, só para brilhar um pouco.</p>
            <p className="text-sm text-muted-foreground">É só uma surpresa do site. Não vale nada no jogo e não tem relação com o apoio.</p>
            <p className="text-xs text-muted-foreground">Dragão em blocos desenhado pela equipe.</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setAberto(false);
                  // O painel some: o foco vai para o título da coleção (e não para o início da página).
                  requestAnimationFrame(() => document.getElementById("titulo-esferas")?.focus());
                }}
                className={buttonClass("secondary")}
              >
                Fechar
              </button>
              {!movimentoReduzido && (pendente || !tocando) && (
                <button type="button" onClick={rever} className={buttonClass("secondary")}>
                  Rever a animação
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid max-w-[65ch] gap-2">
          <p id="esferas-explicacao" className="text-muted-foreground">
            Isto apaga só a sua coleção neste aparelho e esconde as 7 esferas de novo. Não muda nada no jogo nem no apoio.
          </p>
          <div>
            <button type="button" aria-describedby="esferas-explicacao" onClick={reiniciar} className={buttonClass("secondary")}>
              Esconder as esferas de novo
            </button>
          </div>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {anuncio}
          {completa && fechamento > 0 && !movimentoReduzido ? " Você reuniu as 7 esferas. Um dragão em blocos aparece numa animação decorativa." : ""}
        </p>
      </div>
    </section>
  );
}

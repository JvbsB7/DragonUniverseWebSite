"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";
import { useCinemaStore, VAGA_CINEMA } from "@/store/cinema";
import { hasWebGL, use3dAllowed } from "@/components/skin-viewer/use-live-canvas";

const CinemaCanvas = dynamic(() => import("./cinema-canvas"), { ssr: false });

/** O canvas cinema está vivo? (qualidade média/alta, depois da 1ª interação, com WebGL e com vaga no limite global de 2.) */
export function useCinemaAoVivo(): boolean {
  const vaga = useSkinViewerStore((s) => s.live.includes(VAGA_CINEMA));
  const falhou = useCinemaStore((s) => s.falhou);
  return vaga && !falhou;
}

// Fica no layout: não renderiza nada até alguma vista (CinemaView) entrar na tela. Aí pede a vaga e carrega o canvas sob
// demanda (three/R3F fora do JS crítico). Quando nenhuma vista está visível por 3 s, devolve a vaga e libera o contexto.
export function CinemaHost() {
  const permitido = use3dAllowed();
  const interagiu = useSkinViewerStore((s) => s.interacted);
  const quantas = useCinemaStore((s) => s.visiveis.length);
  const vivo = useCinemaAoVivo();
  const falhar = useCinemaStore((s) => s.falhar);
  // Aba oculta por mais de 5 s: libera o canvas (e a GPU) como se nenhuma vista estivesse na tela; ao voltar, ele é pedido de novo.
  const [oculta, setOculta] = useState(false);
  useEffect(() => {
    let t = 0;
    const aba = () => {
      clearTimeout(t);
      if (document.hidden) t = window.setTimeout(() => setOculta(true), 5000);
      else setOculta(false);
    };
    document.addEventListener("visibilitychange", aba);
    return () => {
      document.removeEventListener("visibilitychange", aba);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (permitido) armFirstInteraction();
  }, [permitido]);

  useEffect(() => {
    const { request, release } = useSkinViewerStore.getState();
    if (permitido && interagiu && quantas > 0 && !oculta && hasWebGL()) {
      request(VAGA_CINEMA);
      return;
    }
    const espera = window.setTimeout(() => release(VAGA_CINEMA), quantas === 0 && !oculta ? 3000 : 0);
    return () => clearTimeout(espera);
  }, [permitido, interagiu, quantas, oculta]);

  return vivo ? <CinemaCanvas aoFalhar={falhar} /> : null;
}

"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
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

  useEffect(() => {
    if (permitido) armFirstInteraction();
  }, [permitido]);

  useEffect(() => {
    const { request, release } = useSkinViewerStore.getState();
    if (permitido && interagiu && quantas > 0 && hasWebGL()) {
      request(VAGA_CINEMA);
      return;
    }
    const espera = window.setTimeout(() => release(VAGA_CINEMA), quantas === 0 ? 3000 : 0);
    return () => clearTimeout(espera);
  }, [permitido, interagiu, quantas]);

  return vivo ? <CinemaCanvas aoFalhar={falhar} /> : null;
}

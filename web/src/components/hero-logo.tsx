"use client";

import { useEffect, useId, useRef } from "react";
import { asset } from "@/lib/asset";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";
import { hasWebGL, use3dAllowed } from "@/components/skin-viewer/use-live-canvas";
import type { ControleLogo3D } from "@/components/logo/logo-3d";

// Logo do hero (§6.3). O HTML inicial já traz a imagem estática; o 3D entra por cima quando existe vaga
// no limite global de dois canvases (o mesmo das skins), depois da primeira interação e com a área visível.
// Com prefers-reduced-motion ou sem WebGL, o módulo 3D nem é baixado. Proporção do contêiner: 1934/260.
export function HeroLogo() {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const permitido = use3dAllowed();
  const interagiu = useSkinViewerStore((s) => s.interacted);

  useEffect(() => {
    if (permitido) armFirstInteraction();
  }, [permitido]);

  useEffect(() => {
    const container = box.current;
    const fallback = img.current;
    if (!permitido || !interagiu || !container || !fallback || !hasWebGL()) return;

    let cancelado = false;
    let controle: ControleLogo3D | null = null;
    let cancelarAssinatura = () => {};

    import("@/components/logo/logo-3d").then(({ montarLogo3D }) => {
      if (cancelado) return;
      controle = montarLogo3D({
        container,
        fallback,
        svgUrl: asset("/img/logo/logo-dragon-universe.svg"),
        pngFallbackUrl: asset("/img/logo/logo-dragon-universe-640.png"),
        jaInteragiu: true,
        reservarCanvas: () => {
          const { request, release } = useSkinViewerStore.getState();
          request(id);
          return useSkinViewerStore.getState().live.includes(id) ? () => release(id) : null;
        },
      });
      // Outra cena pediu o canvas e tomou a vaga do logo: volta ao fallback, sem marcar falha.
      cancelarAssinatura = useSkinViewerStore.subscribe((estado, anterior) => {
        if (anterior.live.includes(id) && !estado.live.includes(id)) controle?.liberar();
      });
    });

    return () => {
      cancelado = true;
      cancelarAssinatura();
      controle?.destruir();
      useSkinViewerStore.getState().release(id);
    };
  }, [permitido, interagiu, id]);

  return (
    <div
      ref={box}
      role="img"
      aria-label="Logo do Dragon Universe, em letras azuis blocadas."
      className="relative grid aspect-[1934/260] place-items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={asset("/img/logo/logo-dragon-universe.svg")} width={1934} height={187} alt="" className="h-auto w-[90%]" />
    </div>
  );
}

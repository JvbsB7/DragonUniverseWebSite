"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useCinemaStore } from "@/store/cinema";
import { use3dAllowed } from "@/components/skin-viewer/use-live-canvas";
import { useCinemaAoVivo } from "./cinema-host";

const CinemaViewInterna = dynamic(() => import("./cinema-view-interna"), { ssr: false });

export type DimensoesDaVista = { largura: number; altura: number };

type Props = {
  /** Conteúdo 2D (posters, cabeças): é o que a página mostra sem 3D e antes de a cena ficar pronta. */
  fallback: ReactNode;
  /** Mundo visível (em px de skin) que a vista deve enquadrar; o zoom é o maior que cabe nas duas direções. */
  mundo: { largura: number; altura: number; centroY?: number };
  /** A cena 3D. Chama `aoPronto` quando as texturas estiverem aplicadas (o fallback sai de cena). */
  cena: (aoPronto: () => void) => ReactNode;
  className?: string;
  /** Descrição lida no lugar da cena (role="img"). */
  alt?: string;
};

// Uma região da página desenhada pelo canvas cinema compartilhado. Sem 3D (movimento reduzido, celular, sem WebGL, sem
// vaga), só o fallback aparece e nenhum código 3D é baixado.
export function CinemaView({ fallback, mundo, cena, className, alt }: Props) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const permitido = use3dAllowed();
  const aoVivo = useCinemaAoVivo();
  const mostrar = useCinemaStore((s) => s.mostrar);
  const ocultar = useCinemaStore((s) => s.ocultar);
  const [tamanho, setTamanho] = useState<DimensoesDaVista | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || !permitido) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? mostrar(id) : ocultar(id)), { rootMargin: "100px" });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) setTamanho({ largura: el.clientWidth, altura: el.clientHeight });
    });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      ocultar(id);
    };
  }, [permitido, id, mostrar, ocultar]);

  // Sem canvas, a cena some e a próxima vez recomeça do fallback.
  const ativo = permitido && aoVivo && tamanho !== null;
  const zoom = tamanho ? Math.min(tamanho.largura / mundo.largura, tamanho.altura / mundo.altura) : 1;

  return (
    <div ref={box} {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })} className={className}>
      {!(ativo && pronto) && fallback}
      {ativo && (
        <CinemaViewInterna zoom={zoom} centroY={mundo.centroY ?? 0}>{cena(() => setPronto(true))}</CinemaViewInterna>
      )}
    </div>
  );
}

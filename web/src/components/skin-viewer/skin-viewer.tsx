"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { SkinFace } from "./skin-face";
import { use3dAllowed, useLiveCanvas } from "./use-live-canvas";
import type { SkinAnimation } from "@/store/skin-viewer";
import { asset, assetSet } from "@/lib/asset";
import { cn } from "@/lib/utils";

// Carregado só quando a cena ganha uma vaga: three.js e skinview3d ficam fora do bundle inicial.
const SkinCanvas = dynamic(() => import("./skin-canvas"), { ssr: false });

type Props = {
  skin: string;
  /** Descrição da skin, lida no lugar do canvas. */
  alt: string;
  animation?: SkinAnimation;
  autoRotate?: boolean;
  zoom?: number;
  /** Duração máxima do gesto, em ms (padrão: 3 s dos apresentadores). */
  duracao?: number;
  /** Imagem estática real mostrada antes do 3D e quando não há 3D. Sem ela, mostra a cabeça 2D. */
  poster?: { src: string; srcSet?: string; sizes?: string; width: number; height: number };
  className?: string;
};

// Skin 3D decorativa de uma pessoa. Sem 3D (sem WebGL, reduced-motion ou antes de carregar), mostra a cabeça 2D.
export function SkinViewer({ skin, alt, animation = "idle", autoRotate = false, zoom = 0.9, duracao, poster, className }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const live = useLiveCanvas(box, use3dAllowed() && !failed);

  return (
    <div
      ref={box}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      className={cn("relative flex h-56 items-center justify-center", className)}
    >
      {!(live && ready) &&
        (poster ? (
          <img src={asset(poster.src)} srcSet={poster.srcSet && assetSet(poster.srcSet)} sizes={poster.sizes} width={poster.width} height={poster.height} alt="" className="h-full w-full object-contain" />
        ) : (
          <SkinFace src={skin} className="size-28" />
        ))}
      {live && (
        <SkinCanvas
          key={skin}
          skin={skin}
          animation={animation}
          autoRotate={autoRotate}
          zoom={zoom}
          duracao={duracao}
          onReadyChange={setReady}
          onFail={() => setFailed(true)}
        />
      )}
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { CinemaView } from "@/components/cinema/cinema-view";
import { SkinFace } from "./skin-face";
import type { SkinAnimation } from "@/store/skin-viewer";
import { asset, assetSet } from "@/lib/asset";
import { cn } from "@/lib/utils";

// Carregado só quando a vista ganha o canvas cinema: three, R3F e o rig ficam fora do bundle inicial.
const CenaApresentador = dynamic(() => import("./cena-apresentador"), { ssr: false });

type Props = {
  skin: string;
  /** Descrição da skin, lida no lugar da cena. */
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

// Skin 3D decorativa de uma pessoa, desenhada pelo canvas cinema compartilhado (v4: sem renderer próprio).
// Sem 3D (sem WebGL, reduced-motion, celular ou antes de carregar), mostra o poster ou a cabeça 2D.
// `autoRotate` e `zoom` ficam por compatibilidade com a v3: a cena enquadra o personagem inteiro e não gira.
export function SkinViewer({ skin, alt, animation = "idle", duracao, poster, className }: Props) {
  return (
    <CinemaView
      alt={alt}
      className={cn("relative flex h-56 items-center justify-center", className)}
      mundo={{ largura: 26, altura: 37 }}
      fallback={
        poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(poster.src)} srcSet={poster.srcSet && assetSet(poster.srcSet)} sizes={poster.sizes} width={poster.width} height={poster.height} alt="" className="h-full w-full object-contain" />
        ) : (
          <SkinFace src={skin} className="size-28" />
        )
      }
      cena={(aoPronto) => <CenaApresentador skin={skin} animation={animation} duracao={duracao} aoPronto={aoPronto} />}
    />
  );
}

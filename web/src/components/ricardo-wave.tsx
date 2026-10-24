"use client";

import { SkinViewer } from "@/components/skin-viewer/skin-viewer";

// Imagens de reserva: render do próprio modelo (skinview3d, pose frontal, sem editar a textura) com fundo transparente.
// Ricardo nas categorias da wiki: um aceno de até 1.800 ms depois da primeira interação e enquanto estiver visível,
// mediante vaga no gerenciador global (máximo de 2 canvases). Sem vaga, sem WebGL ou com movimento reduzido,
// fica a imagem estática real, sem baixar o 3D. Decorativo: sem foco nem eventos.
export function RicardoWave() {
  return (
    <SkinViewer
      skin="/skins/rvmm.png"
      alt=""
      animation="wave"
      duracao={1800}
      zoom={0.95}
      poster={{
        src: "/img/apresentadores/rvmm-192.webp",
        srcSet: "/img/apresentadores/rvmm-64.webp 64w, /img/apresentadores/rvmm-96.webp 96w, /img/apresentadores/rvmm-128.webp 128w, /img/apresentadores/rvmm-192.webp 192w, /img/apresentadores/rvmm-224.webp 224w",
        sizes: "(min-width: 48rem) 96px, 64px",
        width: 192,
        height: 336,
      }}
      className="h-full w-full"
    />
  );
}

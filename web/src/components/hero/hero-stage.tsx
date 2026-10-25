"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { asset } from "@/lib/asset";
import { perfilLeve } from "@/lib/perfil";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";
import { use3dAllowed, useLiveCanvas } from "@/components/skin-viewer/use-live-canvas";

// Palco da área visual do hero (design §8; decisões M4/M7). O HTML inicial traz tudo em 2.5D: logo SVG e o pôster com alfa
// do Planeta do Bills (children), cada um com proporção reservada. A cena R3F (logo 3D + planeta .glb médio + partículas) é
// um chunk à parte, baixado só depois de: movimento permitido, perfil completo (desktop, ponteiro fino, > 4 núcleos, sem
// economia de dados), interação ou ociosidade de 8 s, palco visível e vaga livre no limite global de 2 canvases.
// Os elementos 2D só somem (opacidade) depois do primeiro quadro 3D e voltam se a cena falhar; a troca não desloca nada.
// A legenda e o status do Bills ficam FORA do palco (na página), então não dependem do renderizador.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const semAssinatura = () => () => {};

export function HeroStage({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);
  const permitido = use3dAllowed();
  const leve = useSyncExternalStore(semAssinatura, perfilLeve, () => true);
  const habilitado = permitido && !leve;
  const [falhou, setFalhou] = useState(false);
  const vivo = useLiveCanvas(box, habilitado && !falhou);
  const [logoPronto, setLogoPronto] = useState(false);
  const [planetaPronto, setPlanetaPronto] = useState(false);

  useEffect(() => {
    if (!habilitado) return;
    armFirstInteraction();
    const id = window.setTimeout(() => useSkinViewerStore.setState({ interacted: true }), 8000);
    return () => window.clearTimeout(id);
  }, [habilitado]);

  const aoLogoPronto = useCallback(() => setLogoPronto(true), []);
  const aoPlanetaPronto = useCallback(() => setPlanetaPronto(true), []);
  const aoFalhar = useCallback(() => setFalhou(true), []);
  const em3d = vivo && !falhou;

  // Profundidade 2.5D por CSS (só com 3D desligado e mouse): a camada do pôster desloca até 6 px; sem loop ativo.
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || document.documentElement.dataset.perfil !== "completo" || em3d) return;
    const el = box.current;
    if (!el) return;
    const { clientX: x, clientY: y } = e;
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", (((x - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", (((y - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };
  const sair = () => {
    cancelAnimationFrame(quadro.current);
    box.current?.style.setProperty("--px", "0");
    box.current?.style.setProperty("--py", "0");
  };

  return (
    <div ref={box} data-hero-stage data-logo={em3d && logoPronto ? "3d" : "2d"} data-planeta={em3d && planetaPronto ? "3d" : "2d"} onPointerMove={mover} onPointerLeave={sair} className="relative">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <div
          data-hero-logo
          role="img"
          aria-label="Logo do Dragon Universe, em letras azuis blocadas."
          className="relative grid aspect-[1934/420] place-items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/logo/logo-dragon-universe.svg")} width={1934} height={187} alt="" fetchPriority="low" className="hero-2d-logo h-auto w-[90%]" />
        </div>
      </div>
      <div data-hero-print className="px-4 pb-4 md:px-6 md:pb-6">
        {children}
      </div>
      {em3d && <HeroScene aoLogoPronto={aoLogoPronto} aoPlanetaPronto={aoPlanetaPronto} aoFalhar={aoFalhar} />}
    </div>
  );
}

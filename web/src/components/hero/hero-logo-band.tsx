"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { asset } from "@/lib/asset";
import { perfilLeve } from "@/lib/perfil";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";
import { use3dAllowed, useLiveCanvas } from "@/components/skin-viewer/use-live-canvas";

// A cena R3F é um chunk à parte (R3F + three + drei): só é baixada depois que tudo isto é verdade (decisão M4/M7):
// movimento permitido, perfil completo (desktop, ponteiro fino, > 4 núcleos, sem economia de dados), interação ou
// ociosidade de 8 s, a faixa visível e uma vaga livre no limite global de 2 canvases.
// Até lá (e sempre no celular, em movimento reduzido ou sem WebGL) o hero é o logo SVG estático (2.5D), que já está no
// HTML com proporção reservada: a troca não desloca nada. O logo 2D só some depois do primeiro quadro 3D.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const semAssinatura = () => () => {};

export function HeroLogoBand() {
  const box = useRef<HTMLDivElement>(null);
  const permitido = use3dAllowed();
  const leve = useSyncExternalStore(semAssinatura, perfilLeve, () => true);
  const habilitado = permitido && !leve;
  const vivo = useLiveCanvas(box, habilitado);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!habilitado) return;
    armFirstInteraction();
    const id = window.setTimeout(() => useSkinViewerStore.setState({ interacted: true }), 8000);
    return () => window.clearTimeout(id);
  }, [habilitado]);

  const aoPronto = useCallback(() => setPronto(true), []);
  const aoFalhar = useCallback(() => setFalhou(true), []);
  const em3d = vivo && !falhou;

  return (
    <div
      ref={box}
      role="img"
      aria-label="Logo do Dragon Universe, em letras azuis blocadas."
      className="relative grid aspect-[1934/420] place-items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/img/logo/logo-dragon-universe.svg")}
        width={1934}
        height={187}
        alt=""
        fetchPriority="low"
        className="h-auto w-[90%] transition-opacity duration-300"
        style={{ opacity: em3d && pronto ? 0 : 1 }}
      />
      {em3d && <HeroScene aoPronto={aoPronto} aoFalhar={aoFalhar} />}
    </div>
  );
}

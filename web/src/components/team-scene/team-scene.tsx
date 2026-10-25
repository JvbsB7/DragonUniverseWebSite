"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { SkinFace } from "@/components/skin-viewer/skin-face";
import { use3dAllowed, useLiveCanvas } from "@/components/skin-viewer/use-live-canvas";
import { equipe } from "@/config/equipe";
import { cn } from "@/lib/utils";

const TeamSceneCanvas = dynamic(() => import("./team-scene-canvas"), { ssr: false });

// Energia decorativa sob cada nome (home e /equipe): marca, God e Golden. Só decora, não indica status.
const energias = ["var(--du-energy-brand)", "var(--du-energy-god)", "var(--du-energy-golden)"];

// Arte da equipe: os três personagens juntos em um único canvas, interagindo. É decorativa (sem controles).
// Legendas visíveis só com os nomes; o texto alternativo descreve a cena (§8.1 e §8.5).
export function TeamScene({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const live = useLiveCanvas(box, use3dAllowed() && !failed);

  return (
    <figure className={cn("mx-auto w-full max-w-[60rem]", className)}>
      <div
        ref={box}
        role="img"
        aria-label="Cena 3D da equipe: João acena para Ricardo, e Luan voa ao lado."
        // 343 × 240 no celular e até 960 × 400 no desktop.
        className="relative h-60 w-full overflow-hidden rounded-xl border border-edge bg-bg bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_srgb,var(--du-brand-decor)_45%,transparent)_0%,transparent_70%)] md:h-[25rem]"
      >
        {!(live && ready) && (
          <div className="absolute inset-0 flex items-center justify-center gap-6 md:gap-12">
            {equipe.map((m) => (
              <SkinFace key={m.skin} src={m.skin} className="aspect-square w-1/4 max-w-20 md:max-w-28" />
            ))}
          </div>
        )}
        {live && <TeamSceneCanvas onReadyChange={setReady} onFail={() => setFailed(true)} />}
      </div>
      <ul aria-hidden="true" className="mt-4 grid grid-cols-3 gap-3 md:mx-auto md:max-w-3xl md:gap-8">
        {["João", "Ricardo", "Luan"].map((nome, i) => (
          <li key={nome} className="grid min-w-0 justify-items-center gap-2 text-center font-display text-lg font-bold md:text-2xl">
            {nome}
            <span className="block h-1 w-full max-w-16" style={{ background: energias[i] }} />
          </li>
        ))}
      </ul>
    </figure>
  );
}

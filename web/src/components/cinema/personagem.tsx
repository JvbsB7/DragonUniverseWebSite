"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";
import { inferModelType, loadImage, loadSkinToCanvas } from "skinview-utils";
// Só o modelo (caixas com UV da skin, camada externa e braço slim/clássico); não importa o viewer nem o renderer do skinview3d.
import { PlayerObject } from "skinview3d/libs/model.js";
import { asset } from "@/lib/asset";
import { amostrar, criarAdaptador, poseNeutra, type Clipe, type Pose } from "@/lib/personagens";

// Textura de cada skin carregada uma vez e compartilhada por todas as vistas (no rig antigo, cada Presenter baixava a sua).
const texturas = new Map<string, Promise<CanvasTexture>>();
function texturaDaSkin(url: string): Promise<CanvasTexture> {
  let p = texturas.get(url);
  if (!p) {
    p = loadImage(asset(url)).then((imagem) => {
      const canvas = document.createElement("canvas");
      loadSkinToCanvas(canvas, imagem);
      const t = new CanvasTexture(canvas);
      t.magFilter = NearestFilter;
      t.minFilter = NearestFilter;
      t.colorSpace = SRGBColorSpace;
      t.userData.slim = inferModelType(canvas) === "slim";
      return t;
    });
    p.catch(() => texturas.delete(url));
    texturas.set(url, p);
  }
  return p;
}

export type Papel = {
  skin: string;
  x: number;
  y: number;
  giro: number;
  clipe: Clipe;
  /** Ajustes por quadro sobre a pose do clipe (olhar, flutuar). `t` em segundos desde o início. */
  ajustar?: (t: number, pose: Pose) => void;
  /** Ao fim da apresentação: "repouso" volta à pose parada; "congelar" fica na última pose do clipe (voo). */
  fim?: "repouso" | "congelar";
};

type Props = {
  papeis: Papel[];
  /** Duração da apresentação em ms; depois dela o ciclo de renderização para e o quadro final fica na tela. */
  duracaoMs: number;
  /** Já apresentada nesta visita: vai direto à pose final. */
  jaApresentada: boolean;
  aoPronto: () => void;
};

// Personagens de uma vista do canvas cinema. Anima por `useFrame` com o loop em demanda: só pede quadro enquanto toca.
export function Personagens({ papeis, duracaoMs, jaApresentada, aoPronto }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  // O PlayerObject mede 1 unidade por pixel de skin (pés em y = -16, topo em 16). Cape, elytra e orelhas ficam escondidas,
  // senão aparece uma placa lisa atrás do corpo.
  const jogadores = useMemo(
    () =>
      papeis.map(() => {
        const player = new PlayerObject();
        player.cape.visible = false;
        player.elytra.visible = false;
        player.ears.visible = false;
        return player;
      }),
    [papeis],
  );
  const adaptadores = useRef<ReturnType<typeof criarAdaptador>[]>([]);
  const [prontos, setProntos] = useState(false);
  const t = useRef(0);
  const terminou = useRef(false);

  useEffect(() => {
    let vivo = true;
    Promise.all(papeis.map((p) => texturaDaSkin(p.skin))).then(
      (ts) => {
        if (!vivo) return;
        // O adaptador lê o repouso do modelo: modelType e textura vêm antes dele.
        adaptadores.current = ts.map((tex, i) => {
          const player = jogadores[i];
          player.skin.modelType = tex.userData.slim ? "slim" : "default";
          player.skin.map = tex;
          return criarAdaptador(player);
        });
        setProntos(true);
        t.current = jaApresentada ? duracaoMs / 1000 : 0;
        terminou.current = false;
        aoPronto();
        invalidate();
      },
      () => {},
    );
    return () => {
      vivo = false;
    };
    // Os papéis são estáveis por montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papeis, jogadores]);

  const desenhar = (tempo: number, final: boolean) => {
    papeis.forEach((papel, i) => {
      const parado = final && papel.fim !== "congelar";
      const ts = final ? (papel.fim === "congelar" ? papel.clipe.duracao * 0.5 : 0) : tempo;
      const pose = parado ? poseNeutra() : amostrar(papel.clipe, ts);
      if (!parado) papel.ajustar?.(ts, pose);
      adaptadores.current[i]?.aplicar(pose);
    });
  };

  useFrame((_, dt) => {
    if (!prontos || terminou.current) return;
    t.current += Math.min(dt, 0.1);
    const fim = t.current >= duracaoMs / 1000;
    desenhar(t.current, fim);
    if (fim) terminou.current = true;
    else invalidate();
  });

  return (
    <>
      <ambientLight intensity={3} />
      <pointLight position={[0, 20, 80]} intensity={0.6} decay={0} />
      {papeis.map((papel, i) => (
        <group key={papel.skin} position={[papel.x, papel.y, 0]} rotation={[0, papel.giro, 0]}>
          <primitive object={jogadores[i]} visible={prontos} />
        </group>
      ))}
    </>
  );
}

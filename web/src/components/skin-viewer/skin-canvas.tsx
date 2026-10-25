"use client";

import { useEffect, useRef } from "react";
import {
  IdleAnimation,
  RunningAnimation,
  SkinViewer as Viewer,
  WalkingAnimation,
  WaveAnimation,
  type PlayerAnimation,
} from "skinview3d";
import { asset } from "@/lib/asset";
import { dragonBallFlight } from "./animations";
import { DURACAO_APRESENTADOR, apresentadas, type SkinAnimation } from "@/store/skin-viewer";
import { silenciarAvisoDoClock } from "@/lib/three-compat";

silenciarAvisoDoClock();

const animations: Record<SkinAnimation, () => PlayerAnimation> = {
  idle: () => new IdleAnimation(),
  walk: () => new WalkingAnimation(),
  run: () => new RunningAnimation(),
  fly: dragonBallFlight,
  wave: () => new WaveAnimation(),
};

type Props = {
  skin: string;
  animation: SkinAnimation;
  autoRotate: boolean;
  zoom: number;
  duracao?: number;
  onFail: () => void;
  onReadyChange: (ready: boolean) => void;
};

// Canvas WebGL do skinview3d. Cria o viewer ao montar e libera o contexto ao desmontar.
export default function SkinCanvas({ skin, animation, autoRotate, zoom, duracao = DURACAO_APRESENTADOR, onFail, onReadyChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    el.appendChild(canvas);
    let v: Viewer;
    try {
      v = new Viewer({
        canvas,
        width: el.clientWidth || 160,
        height: el.clientHeight || 220,
        zoom,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      canvas.remove();
      onFail();
      return;
    }
    canvas.style.touchAction = "pan-y"; // arrastar na horizontal gira; na vertical a página rola
    v.controls.enableZoom = false; // a roda do mouse continua rolando a página
    v.controls.enablePan = false;
    viewer.current = v;
    let alive = true;
    // Uma apresentação por visita (movimento.md §6.2 e §8.3): o gesto dura no máximo 3 s e termina em pose estática,
    // sem animação infinita. Quem já se apresentou só mostra a pose final.
    const chave = `${skin}|${animation}`;
    const jaApresentada = apresentadas.has(chave);
    let fim = 0;
    const encerrar = () => {
      if (!alive) return;
      // Voo termina na própria pose de voo; os demais voltam à pose parada.
      if (animation !== "fly") v.animation = null;
      v.render();
      v.renderPaused = true;
    };
    v.loadSkin(asset(skin)).then(
      () => {
        if (!alive) return;
        onReadyChange(true);
        apresentadas.add(chave);
        if (jaApresentada && animation !== "fly") encerrar();
        else fim = window.setTimeout(encerrar, jaApresentada ? 250 : duracao);
      },
      () => alive && onFail(),
    );
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        v.setSize(el.clientWidth, el.clientHeight);
        // Pausado, o redimensionamento limparia o quadro: desenha de novo.
        if (v.renderPaused) v.render();
      }
    });
    ro.observe(el);
    return () => {
      alive = false;
      clearTimeout(fim);
      onReadyChange(false);
      ro.disconnect();
      viewer.current = null;
      v.renderer.forceContextLoss();
      v.dispose();
      canvas.remove();
    };
    // O viewer é criado uma vez por montagem; animação e rotação têm efeitos próprios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skin, zoom]);

  useEffect(() => {
    if (viewer.current) viewer.current.animation = animations[animation]();
  }, [animation, skin, zoom]);

  useEffect(() => {
    if (viewer.current) viewer.current.autoRotate = autoRotate;
  }, [autoRotate, skin, zoom]);

  return <div ref={host} aria-hidden="true" className="absolute inset-0 cursor-grab rounded-md active:cursor-grabbing" />;
}

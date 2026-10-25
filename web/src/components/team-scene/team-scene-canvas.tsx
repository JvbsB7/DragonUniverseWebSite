"use client";

import { useEffect, useRef } from "react";
import { CanvasTexture, Group, NearestFilter } from "three";
import { inferModelType, loadImage, loadSkinToCanvas } from "skinview-utils";
import { FunctionAnimation, IdleAnimation, PlayerObject, SkinViewer, WaveAnimation, type PlayerAnimation } from "skinview3d";
import { asset } from "@/lib/asset";
import { dragonBallFlight } from "@/components/skin-viewer/animations";
import { DURACAO_CENA, apresentadas } from "@/store/skin-viewer";
import { liberarViewer, silenciarAvisoDoClock } from "@/lib/three-compat";

silenciarAvisoDoClock();

type Actor = { skin: string; x: number; y: number; turn: number; animation: () => PlayerAnimation };

// Coreografia: João acena para o Ricardo, o Ricardo vira a cabeça para ele e o Luan voa ao lado.
const actors: Actor[] = [
  { skin: "/skins/jvbs.png", x: -26, y: 0, turn: 0.5, animation: () => new WaveAnimation("left") },
  { skin: "/skins/rvmm.png", x: 0, y: 0, turn: -0.2, animation: () => new IdleAnimation() },
  { skin: "/skins/luan.png", x: 27, y: 6, turn: -0.9, animation: dragonBallFlight },
];

// Mais estreito que 3:2 (celular), a câmera recua para caberem os três.
const zoomFor = (width: number, height: number) => (width / height < 1.5 ? 0.5 : 0.6);

type Props = { onFail: () => void; onReadyChange: (ready: boolean) => void };

export default function TeamSceneCanvas({ onFail, onReadyChange }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    el.appendChild(canvas);
    const width = el.clientWidth || 640;
    const height = el.clientHeight || 320;
    let viewer: SkinViewer;
    try {
      viewer = new SkinViewer({
        canvas,
        width,
        height,
        zoom: zoomFor(width, height),
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      canvas.remove();
      onFail();
      return;
    }
    // Arte, não visualizador: sem arrastar, sem zoom; a página rola normalmente por cima.
    viewer.controls.enabled = false;
    canvas.style.pointerEvents = "none";

    // O jogador padrão do viewer fica vazio; cada personagem tem o seu grupo (posição) e o seu PlayerObject (pose).
    const cast = actors.map((actor) => {
      const player = new PlayerObject();
      player.skin.visible = false;
      const spot = new Group();
      spot.position.set(actor.x, actor.y, 0);
      spot.rotation.y = actor.turn;
      spot.add(player);
      viewer.scene.add(spot);
      return { player, spot, animation: actor.animation() };
    });

    const textures: CanvasTexture[] = [];
    let alive = true;
    Promise.all(actors.map((a) => loadImage(asset(a.skin)))).then(
      (images) => {
        if (!alive) return;
        images.forEach((image, i) => {
          const skinCanvas = document.createElement("canvas");
          loadSkinToCanvas(skinCanvas, image);
          const texture = new CanvasTexture(skinCanvas);
          texture.magFilter = NearestFilter;
          texture.minFilter = NearestFilter;
          textures.push(texture);
          const { player } = cast[i];
          player.skin.modelType = inferModelType(skinCanvas);
          player.skin.map = texture;
          player.skin.visible = true;
        });
        onReadyChange(true);
        apresentadas.add("cena-equipe");
        fim = window.setTimeout(encerrar, jaApresentada ? 600 : DURACAO_CENA);
      },
      () => alive && onFail(),
    );

    const [joao, ricardo, luan] = cast;
    let time = 0;
    // A cena se apresenta uma vez por visita e termina em pose: depois de 4 s (ou de 1 s, se já foi vista) o ciclo
    // de renderização para e o quadro final fica na tela (movimento.md §6.2 e §8.3).
    const jaApresentada = apresentadas.has("cena-equipe");
    let fim = 0;
    const encerrar = () => {
      if (!alive) return;
      viewer.render();
      viewer.renderPaused = true;
    };
    viewer.animation = new FunctionAnimation((_player, _progress, delta) => {
      time += delta;
      for (const { player, animation } of cast) animation.update(player, delta);
      // Ricardo responde ao aceno virando a cabeça para o João.
      ricardo.player.skin.head.rotation.y = 0.55 + Math.sin(time * 1.3) * 0.08;
      // Luan flutua e o João acompanha com o olhar.
      luan.spot.position.y = actors[2].y + Math.sin(time * 1.8) * 1.5;
      joao.player.skin.head.rotation.y = Math.sin(time * 0.6) * 0.1;
    });

    const ro = new ResizeObserver(() => {
      if (el.clientWidth === 0 || el.clientHeight === 0) return;
      viewer.setSize(el.clientWidth, el.clientHeight);
      viewer.zoom = zoomFor(el.clientWidth, el.clientHeight);
      // Pausado, o redimensionamento limparia o quadro: desenha de novo.
      if (viewer.renderPaused) viewer.render();
    });
    ro.observe(el);

    return () => {
      alive = false;
      clearTimeout(fim);
      onReadyChange(false);
      ro.disconnect();
      textures.forEach((t) => t.dispose());
      viewer.renderer.forceContextLoss();
      liberarViewer(viewer);
      canvas.remove();
    };
    // A cena é criada uma vez por montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} aria-hidden="true" className="absolute inset-0" />;
}

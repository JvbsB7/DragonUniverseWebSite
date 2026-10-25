"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { qualidadeAtual } from "@/lib/perfil";

// Canvas cinema: um único contexto WebGL fixo sobre a página, com pointer-events desligados. Cada CinemaView é uma região
// (scissor) deste canvas. Loop em demanda: as cenas pedem quadro enquanto animam; rolar e redimensionar também pedem,
// porque as regiões acompanham o DOM.
function Limpar() {
  // As vistas são transparentes; sem limpar, o quadro anterior ficaria por baixo e acumularia rastro.
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);
  return null;
}

function Redesenhar() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let quadro = 0;
    const pedir = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => invalidate());
    };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir, { passive: true });
    document.addEventListener("visibilitychange", pedir);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      document.removeEventListener("visibilitychange", pedir);
    };
  }, [invalidate]);
  return null;
}

export default function CinemaCanvas({ aoFalhar }: { aoFalhar: () => void }) {
  // DPR 1 no nível médio; no alto, até 1,5 (v4-01 §3.2).
  // Ao desmontar, o R3F força a perda do contexto (libera a GPU); isso não é falha e não pode desligar o 3D da página.
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  const dpr = qualidadeAtual() === "alto" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      flat
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ position: "fixed", inset: 0, zIndex: 20, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          if (montado.current) aoFalhar();
        });
      }}
    >
      <Limpar />
      <Redesenhar />
      <View.Port />
    </Canvas>
  );
}

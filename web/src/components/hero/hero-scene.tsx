"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { carregarCenaDoLogo, type CenaDoLogo } from "@/components/logo/logo-3d";
import { asset } from "@/lib/asset";
import { silenciarAvisoDoClock } from "@/lib/three-compat";

silenciarAvisoDoClock();

// Cena R3F do hero (decisão M4 do Coordinator; v3-04-design.md §8.3 e §8.6). Só no desktop, depois de interação ou
// ociosidade, com vaga no limite de 2 canvases e fora do perfil leve. Conteúdo: o logo 3D aprovado (mesma montagem do
// módulo da v2, sem recolorir), partículas em um único `Points` e profundidade pela posição do mouse (até 3°).
// Tudo termina sozinho: a entrada leva 1,8 s, as partículas móveis 3 s e depois o loop fica em "demand" (só redesenha
// quando o mouse mexe). Não recebe foco nem eventos (pointer-events: none).
const ENTRADA = 1800;
const PARTICULAS_MS = 3000;
const GRAUS = THREE.MathUtils.degToRad(3);

type Props = { aoPronto: () => void; aoFalhar: () => void };

// Mutações imperativas do three ficam em funções de módulo (o R3F funciona assim; os componentes só orquestram).
function enquadrar(cam: THREE.OrthographicCamera, larguraCanvas: number, larguraLogo: number) {
  cam.zoom = (larguraCanvas * 0.9) / larguraLogo;
  cam.updateProjectionMatrix();
}

/** Aproxima a rotação do alvo; devolve true enquanto ainda há movimento a desenhar. */
function girar(g: THREE.Group, ry: number, rx: number): boolean {
  const dx = ry - g.rotation.y;
  const dy = rx - g.rotation.x;
  g.rotation.y += dx * 0.18;
  g.rotation.x += dy * 0.18;
  return Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005;
}

function subirParticulas(pts: THREE.Points, base: Float32Array, moveis: number, suave: number) {
  const arr = pts.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < moveis; i++) arr[i * 3 + 1] = base[i * 3 + 1] + suave * 0.9;
  pts.geometry.attributes.position.needsUpdate = true;
}

// Monitor de quadros (design §11.4): >33 ms sustentado por 500 ms tira partículas e resposta ao mouse; se persistir
// por mais 500 ms, devolve o logo ao fallback.
function Monitor({ aoDegradar, aoFalhar }: { aoDegradar: () => void; aoFalhar: () => void }) {
  const lento = useRef(0);
  const nivel = useRef(0);
  const inicio = useRef<number | null>(null);
  useFrame((_, dt) => {
    // A montagem do logo, a compilação dos shaders e a fase automática (entrada de 1,8 s, partículas de 3 s) não contam: o monitor vigia só os quadros guiados pelo mouse.
    if (inicio.current === null) inicio.current = performance.now();
    if (performance.now() - inicio.current < PARTICULAS_MS + 400) return;
    if (dt > 0.033 && dt < 0.25) lento.current += dt * 1000; // >= 0,25 s é pausa entre quadros sob demanda, não lentidão
    else lento.current = 0;
    if (lento.current >= 500) {
      lento.current = 0;
      nivel.current += 1;
      if (nivel.current === 1) aoDegradar();
      else if (nivel.current >= 2) aoFalhar();
    }
  });
  return null;
}

function Particulas({ ativa }: { ativa: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const ref = useRef<THREE.Points>(null);
  const t0 = useRef<number | null>(null);
  const { posicoes, cores, base, moveis } = useMemo(() => {
    const n = 36;
    const p = new Float32Array(n * 3);
    const c = new Float32Array(n * 3);
    const cor = [new THREE.Color("#F8FAFC"), new THREE.Color("#23D7FF"), new THREE.Color("#F6B943")];
    // Pseudo-aleatório determinístico: a mesma cena sempre, sem Math.random no render.
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (rnd() - 0.5) * 22;
      p[i * 3 + 1] = (rnd() - 0.5) * 5.4;
      p[i * 3 + 2] = -1 - rnd();
      const k = cor[i % 3];
      c.set([k.r, k.g, k.b], i * 3);
    }
    return { posicoes: p, cores: c, base: p.slice(), moveis: 12 };
  }, []);

  useFrame(() => {
    const pts = ref.current;
    if (!pts || !ativa) return;
    if (t0.current === null) t0.current = performance.now();
    const t = Math.min((performance.now() - t0.current) / PARTICULAS_MS, 1);
    if (t >= 1 && pts.userData.fim) return;
    subirParticulas(pts, base, moveis, 1 - Math.pow(1 - t, 3));
    if (t < 1) invalidate();
    else pts.userData.fim = true;
  });

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return (
    <Points ref={ref} positions={posicoes} colors={cores} stride={3}>
      <PointMaterial transparent vertexColors size={3} sizeAttenuation={false} depthWrite={false} opacity={0.9} />
    </Points>
  );
}

function Logo({ aoPronto, aoFalhar, ponteiro }: { aoPronto: () => void; aoFalhar: () => void; ponteiro: boolean }) {
  const { camera, size, invalidate } = useThree();
  const [logo, setLogo] = useState<CenaDoLogo | null>(null);
  const alvo = useRef({ x: 0, y: 0 });
  const t0 = useRef<number | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let atual: CenaDoLogo | null = null;
    carregarCenaDoLogo(asset("/img/logo/logo-dragon-universe.svg"), abort.signal)
      .then((l) => {
        if (abort.signal.aborted) return l.liberar();
        atual = l;
        setLogo(l);
      })
      .catch((e) => {
        if (!abort.signal.aborted) {
          console.warn("Logo 3D indisponível:", e);
          aoFalhar();
        }
      });
    return () => {
      abort.abort();
      atual?.liberar();
    };
  }, [aoFalhar]);

  // Enquadramento: o logo ocupa 90% da largura do canvas.
  useEffect(() => {
    if (!logo) return;
    enquadrar(camera as THREE.OrthographicCamera, size.width, logo.largura);
    invalidate();
  }, [logo, camera, size, invalidate]);

  useEffect(() => {
    if (!logo || !ponteiro) return;
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      alvo.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      invalidate();
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => window.removeEventListener("pointermove", mover);
  }, [logo, ponteiro, invalidate]);

  useEffect(() => {
    if (logo) {
      t0.current = performance.now();
      aoPronto();
      invalidate();
    }
  }, [logo, aoPronto, invalidate]);

  useFrame(() => {
    if (!logo || t0.current === null) return;
    const t = Math.min((performance.now() - t0.current) / ENTRADA, 1);
    const restante = 1 - (1 - Math.pow(1 - t, 3));
    const px = ponteiro ? alvo.current.x : 0;
    const py = ponteiro ? alvo.current.y : 0;
    const ry = THREE.MathUtils.degToRad(-2) * restante + px * GRAUS;
    const rx = THREE.MathUtils.degToRad(1) * restante + py * GRAUS;
    if (girar(logo.grupo, ry, rx) || t < 1) invalidate();
  });

  return logo ? <primitive object={logo.cena} /> : null;
}

export default function HeroScene({ aoPronto, aoFalhar }: Props) {
  const [degradado, setDegradado] = useState(false);
  return (
    <Canvas
      orthographic
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 40], near: 0.01, far: 100, zoom: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <AdaptiveDpr pixelated={false} />
      <Monitor aoDegradar={() => setDegradado(true)} aoFalhar={aoFalhar} />
      <Logo aoPronto={aoPronto} aoFalhar={aoFalhar} ponteiro={!degradado} />
      {!degradado && <Particulas ativa />}
    </Canvas>
  );
}

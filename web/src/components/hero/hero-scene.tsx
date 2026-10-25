"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { carregarCenaDoLogo, PROPORCAO_LOGO, type CenaDoLogo } from "@/components/logo/logo-3d";
import { asset } from "@/lib/asset";
import { silenciarAvisoDoClock } from "@/lib/three-compat";

silenciarAvisoDoClock();

// Cena R3F do hero (decisão M4 do Coordinator; design §8.3 e §8.6). Só no desktop completo, depois de interação ou
// ociosidade, com vaga no limite de 2 canvases. Conteúdo: o logo 3D aprovado (mesma montagem da v2), o Planeta do Bills
// em .glb (versão média, 222 KB, voxels e cores do print do João, sem textura do Minecraft), partículas em um único
// `Points` e profundidade pelo mouse. O canvas cobre o palco inteiro e cada peça se posiciona sobre o retângulo do
// elemento 2D que ela substitui (`[data-hero-logo]` e `[data-hero-print]`), então a composição é a mesma do HTML estático.
// Tudo termina sozinho: entrada de 1,8 s, partículas de 3 s e giro lento do planeta de 4 s; depois o loop fica em "demand"
// (só redesenha quando o mouse mexe). Não recebe foco nem eventos (pointer-events: none).
const ENTRADA = 1800;
const PARTICULAS_MS = 3000;
const GIRO_MS = 4000;
const GRAUS = THREE.MathUtils.degToRad(3);
const LARGURA_LOGO = PROPORCAO_LOGO * 2; // largura do logo em unidades da cena (altura = 2), do viewBox do SVG
const URL_PLANETA = "/models/planeta-do-bills-medio.glb";

// Composição do pôster (ativos-addon/bills): câmera em azimute 238° e elevação 24°; o conteúdo ocupa x 138–588 e y 28–530
// de uma imagem 727×559 (5% de respiro em cima e embaixo, 19% nas laterais; margem refeita pela Forja).
const POSTER = { w: 727, h: 559, x0: 138, x1: 588, y0: 28, y1: 530 };
const AZIMUTE = THREE.MathUtils.degToRad(238);
const ELEVACAO = THREE.MathUtils.degToRad(24);

type Props = { aoLogoPronto: () => void; aoPlanetaPronto: () => void; aoFalhar: () => void };
type Retangulo = { cx: number; cy: number; w: number; h: number };

// Mutações imperativas do three ficam em funções de módulo (o R3F funciona assim; os componentes só orquestram).
// Suavização por tempo (não por quadro): converge em ~0,4 s qualquer que seja a taxa de quadros; devolve true enquanto há movimento.
function girar(g: THREE.Object3D, ry: number, rx: number, dt: number): boolean {
  const k = 1 - Math.exp(-Math.min(dt, 0.1) * 12);
  const dx = ry - g.rotation.y;
  const dy = rx - g.rotation.x;
  g.rotation.y += dx * k;
  g.rotation.x += dy * k;
  return Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002;
}

function subirParticulas(pts: THREE.Points, base: Float32Array, moveis: number, suave: number) {
  const arr = pts.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < moveis; i++) arr[i * 3 + 1] = base[i * 3 + 1] + suave * 0.9;
  pts.geometry.attributes.position.needsUpdate = true;
}

function definirZoom(cam: THREE.OrthographicCamera, zoom: number) {
  cam.zoom = zoom;
  cam.updateProjectionMatrix();
}

/** Retângulo (centro e tamanho, em px) de um elemento em relação ao palco. */
function retangulo(seletor: string): Retangulo | null {
  const palco = document.querySelector("[data-hero-stage]");
  const el = document.querySelector(seletor);
  if (!palco || !el) return null;
  const p = palco.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2 - p.left, cy: r.top + r.height / 2 - p.top, w: r.width, h: r.height };
}

/** Zoom da câmera ortográfica: o logo ocupa 90% da largura da faixa do logo (como no HTML). */
function zoomDoPalco(): number | null {
  const faixa = retangulo("[data-hero-logo]");
  return faixa ? (faixa.w * 0.9) / LARGURA_LOGO : null;
}

/**
 * Posiciona o planeta sobre o pôster: gira o modelo para a mesma vista do pôster, mede a projeção e escala/centraliza para
 * que a largura e o centro do conteúdo coincidam com os do pôster exibido.
 */
function encaixarPlaneta(pivo: THREE.Object3D, modelo: THREE.Object3D, zoom: number, largura: number, altura: number, alvo: Retangulo) {
  modelo.rotation.set(ELEVACAO, -AZIMUTE, 0, "XYZ");
  modelo.scale.setScalar(1);
  modelo.position.set(0, 0, 0);
  pivo.position.set(0, 0, 0);
  pivo.updateMatrixWorld(true);
  const caixa = new THREE.Box3().setFromObject(modelo);
  const centro = caixa.getCenter(new THREE.Vector3());
  const extensao = caixa.max.x - caixa.min.x;
  const larguraPx = alvo.w * ((POSTER.x1 - POSTER.x0) / POSTER.w);
  // 1,17: a caixa alinhada aos eixos de um modelo girado é maior que a projeção real; calibrado contra o pôster.
  const escala = (larguraPx / zoom / extensao) * 1.17;
  modelo.scale.setScalar(escala);
  modelo.position.set(-centro.x * escala, -centro.y * escala, -centro.z * escala);
  // Centro do conteúdo no pôster exibido, em px do palco, convertido para a cena.
  const alturaPx = alvo.w * (POSTER.h / POSTER.w);
  const px = alvo.cx - alvo.w / 2 + alvo.w * ((POSTER.x0 + POSTER.x1) / 2 / POSTER.w);
  // 0,035: a projeção real do modelo fica um pouco abaixo do centro da caixa alinhada aos eixos; calibrado contra o pôster.
  const py = alvo.cy - alturaPx / 2 + alturaPx * ((POSTER.y0 + POSTER.y1) / 2 / POSTER.h) - alvo.w * 0.035;
  pivo.position.set((px - largura / 2) / zoom, -(py - altura / 2) / zoom, 0);
}

function posicionarLogo(g: THREE.Object3D, zoom: number, largura: number, altura: number, faixa: Retangulo) {
  g.position.set((faixa.cx - largura / 2) / zoom, -(faixa.cy - altura / 2) / zoom, 0);
}

// Monitor de quadros (design §11.4): >33 ms sustentado por 500 ms tira partículas e resposta ao mouse; se persistir
// por mais 500 ms, devolve o palco ao 2.5D. Só vigia os quadros guiados pelo mouse (a fase automática não conta).
function Monitor({ aoDegradar, aoFalhar }: { aoDegradar: () => void; aoFalhar: () => void }) {
  const lento = useRef(0);
  const nivel = useRef(0);
  const inicio = useRef<number | null>(null);
  useFrame((_, dt) => {
    if (inicio.current === null) inicio.current = performance.now();
    if (performance.now() - inicio.current < GIRO_MS + 400) return;
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
      p[i * 3 + 1] = (rnd() - 0.5) * 18;
      p[i * 3 + 2] = -3 - rnd();
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

// Ponteiro compartilhado por logo e planeta (alvo normalizado de -1 a 1).
function usePonteiro(ativo: boolean) {
  const invalidate = useThree((s) => s.invalidate);
  const alvo = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!ativo) return;
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      alvo.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      invalidate();
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => window.removeEventListener("pointermove", mover);
  }, [ativo, invalidate]);
  return alvo;
}

function Logo({ aoPronto, aoFalhar, ponteiro }: { aoPronto: () => void; aoFalhar: () => void; ponteiro: boolean }) {
  const { camera, size, invalidate } = useThree();
  const [logo, setLogo] = useState<CenaDoLogo | null>(null);
  const alvo = usePonteiro(ponteiro);
  const t0 = useRef<number | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let atual: CenaDoLogo | null = null;
    carregarCenaDoLogo()
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

  // Enquadramento: o zoom vem da faixa do logo e o logo se posiciona sobre ela.
  useEffect(() => {
    if (!logo) return;
    const zoom = zoomDoPalco();
    const faixa = retangulo("[data-hero-logo]");
    if (zoom && faixa) {
      definirZoom(camera as THREE.OrthographicCamera, zoom);
      posicionarLogo(logo.cena, zoom, size.width, size.height, faixa);
    }
    invalidate();
  }, [logo, camera, size, invalidate]);

  useEffect(() => {
    if (logo) {
      t0.current = performance.now();
      aoPronto();
      invalidate();
    }
  }, [logo, aoPronto, invalidate]);

  useFrame((_, dt) => {
    if (!logo || t0.current === null) return;
    const t = Math.min((performance.now() - t0.current) / ENTRADA, 1);
    const restante = 1 - (1 - Math.pow(1 - t, 3));
    const px = ponteiro ? alvo.current.x : 0;
    const py = ponteiro ? alvo.current.y : 0;
    const ry = THREE.MathUtils.degToRad(-2) * restante + px * GRAUS;
    const rx = THREE.MathUtils.degToRad(1) * restante + py * GRAUS;
    if (girar(logo.grupo, ry, rx, dt) || t < 1) invalidate();
  });

  return logo ? <primitive object={logo.cena} /> : null;
}

// Luz do pôster (ativos-addon/bills/pagina-bills.html): hemisfério #dfe8ff/#4a3a66 1,35, sol branco 2,1 em (-3, 5, 4) e contraluz
// #9fb8ff 0,6 em (4, 1, -3), SEM tone mapping. As luzes ficam no espaço do modelo (giram com ele, como a câmera orbitava no
// render) e só iluminam a cena do planeta (cena separada), então o logo aprovado mantém a luz dele.
function criarLuzesDoPlaneta(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight(0xdfe8ff, 0x4a3a66, 1.35));
  const sol = new THREE.DirectionalLight(0xffffff, 2.1);
  sol.position.set(-3, 5, 4);
  const contra = new THREE.DirectionalLight(0x9fb8ff, 0.6);
  contra.position.set(4, 1, -3);
  g.add(sol, sol.target, contra, contra.target);
  return g;
}

/** As luzes ficam na raiz (sem posição nem escala: a luz hemisférica usa a posição para a direção) e só copiam a rotação do modelo. */
function sincronizarLuzes(luzes: THREE.Object3D, pivo: THREE.Object3D, modelo: THREE.Object3D) {
  luzes.quaternion.copy(pivo.quaternion).multiply(modelo.quaternion);
}

function prepararPlaneta(raiz: THREE.Object3D) {
  raiz.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    // Como no render do pôster: sem tone mapping, rugosidade 1 e metalicidade 0 (o padrão do glTF seria metálico).
    (Array.isArray(m) ? m : [m]).forEach((x) => {
      x.toneMapped = false;
      if (x instanceof THREE.MeshStandardMaterial) {
        x.roughness = 1;
        x.metalness = 0;
      }
    });
  });
}

function liberarPlaneta(raiz: THREE.Object3D) {
  raiz.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (m) (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
  });
}

// Renderiza a cena principal (logo e partículas, com tone mapping) e depois a cena do planeta (sem tone mapping e com a luz
// do pôster), sobre o mesmo canvas. Com prioridade > 0 o R3F deixa de renderizar sozinho, então os dois passos são nossos.
function renderizarDuas(gl: THREE.WebGLRenderer, principal: THREE.Scene, planeta: THREE.Scene, cam: THREE.Camera) {
  gl.autoClear = true;
  gl.render(principal, cam);
  gl.autoClear = false;
  gl.render(planeta, cam);
  gl.autoClear = true;
}

function Renderizador({ planeta }: { planeta: THREE.Scene }) {
  useFrame(({ gl, scene, camera }) => renderizarDuas(gl, scene, planeta, camera), 1);
  return null;
}

// Planeta do Bills: .glb médio (222 KB, KHR_mesh_quantization, sem Draco, sem textura), lido com o GLTFLoader do three (sem
// CDN). O nó raiz já vem centrado em X/Z com a base em Y = 0. Falha de rede ou de arquivo é tratada aqui (aviso, sem erro
// não capturado) e devolve o palco ao 2.5D inteiro, liberando o canvas e a vaga. Giro lento de 4 s (±10° em torno da vista
// do pôster, terminando nela) e profundidade pelo mouse (±4°).
function Planeta({ ponteiro, aoPronto, aoFalhar }: { ponteiro: boolean; aoPronto: () => void; aoFalhar: () => void }) {
  const { size, invalidate } = useThree();
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const pivo = useRef<THREE.Group>(null);
  const modelo = useRef<THREE.Group>(null);
  const luzes = useMemo(() => criarLuzesDoPlaneta(), []);
  const alvo = usePonteiro(ponteiro);
  const t0 = useRef<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    let atual: THREE.Group | null = null;
    new GLTFLoader()
      .loadAsync(asset(URL_PLANETA))
      .then((g) => {
        if (cancelado) return liberarPlaneta(g.scene);
        prepararPlaneta(g.scene);
        atual = g.scene;
        setScene(g.scene);
      })
      .catch((e) => {
        if (cancelado) return;
        console.warn("Planeta 3D indisponível:", e instanceof Error ? e.message : e);
        aoFalhar();
      });
    return () => {
      cancelado = true;
      if (atual) liberarPlaneta(atual);
    };
  }, [aoFalhar]);

  useEffect(() => {
    if (!scene) return;
    const zoom = zoomDoPalco();
    // O pôster é o <figure> dentro de [data-hero-print] (o wrapper tem o padding do palco).
    const fig = retangulo("[data-hero-print] figure");
    if (!zoom || !fig || !pivo.current || !modelo.current) return;
    encaixarPlaneta(pivo.current, modelo.current, zoom, size.width, size.height, fig);
    sincronizarLuzes(luzes, pivo.current, modelo.current);
    invalidate();
    aoPronto();
  }, [size, scene, invalidate, aoPronto, luzes]);

  useFrame((_, dt) => {
    const g = pivo.current;
    if (!g) return;
    if (t0.current === null) t0.current = performance.now();
    const t = Math.min((performance.now() - t0.current) / GIRO_MS, 1);
    const giro = Math.sin(Math.PI * t) * THREE.MathUtils.degToRad(10) * (1 - t);
    const px = ponteiro ? alvo.current.x : 0;
    const py = ponteiro ? alvo.current.y : 0;
    const movendo = girar(g, giro + px * THREE.MathUtils.degToRad(4), py * THREE.MathUtils.degToRad(2), dt);
    if (modelo.current) sincronizarLuzes(luzes, g, modelo.current);
    if (movendo || t < 1) invalidate();
  });

  if (!scene) return null;
  return (
    <>
      <primitive object={luzes} />
      <group ref={pivo}>
        <group ref={modelo}>
          <primitive object={scene} />
        </group>
      </group>
    </>
  );
}

export default function HeroScene({ aoLogoPronto, aoPlanetaPronto, aoFalhar }: Props) {
  const [degradado, setDegradado] = useState(false);
  const cenaPlaneta = useMemo(() => new THREE.Scene(), []);
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
      <Renderizador planeta={cenaPlaneta} />
      <Monitor aoDegradar={() => setDegradado(true)} aoFalhar={aoFalhar} />
      <Logo aoPronto={aoLogoPronto} aoFalhar={aoFalhar} ponteiro={!degradado} />
      {createPortal(<Planeta ponteiro={!degradado} aoPronto={aoPlanetaPronto} aoFalhar={aoFalhar} />, cenaPlaneta)}
      {!degradado && <Particulas ativa />}
    </Canvas>
  );
}

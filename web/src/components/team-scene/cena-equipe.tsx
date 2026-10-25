"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, type PerspectiveCamera as CameraThree, type Sprite, type SpriteMaterial } from "three";
import { texturaDeBrilho } from "@/components/cinema/brilho";
import { onda } from "@/components/cinema/clipes-site";
import { novoPlayer, texturaDaSkin, vestirPlayer } from "@/components/cinema/personagem";
import { CLIPES, amostrar, misturar, poseNeutra, type Pose } from "@/lib/personagens";
import { useEquipeStore } from "@/store/equipe";
import { DURACAO_CENA, apresentadas } from "@/store/skin-viewer";
import type { IdDaPessoa } from "@/config/equipe";

// Vitrine da equipe (v4-03 §7.1): JvbsBR à esquerda (azul), Luan flutuando ao centro de braços cruzados (D12) e rvmm255 à direita
// (carmesim, D15). Do v3 ficam o aceno do João, o olhar do Ricardo para ele e o Luan flutuando, numa apresentação de 4 s por visita;
// depois a cena fica parada (sem rotação nem zoom livres). Selecionar uma pessoa aproxima a câmera por uma trajetória curta
// (≈ 450 ms, até 12% mais perto e ~6° de giro) e leva a pessoa à pose de seleção; os outros continuam visíveis.
const AZUL = "#1674FF";
const CARMESIM = "#E62E52";
const VIOLETA = "#A57BFA";
const DISTANCIA = 126; // fov 30°: 67,5 unidades de altura visível, 120 de largura (palco 744 × 420)

type Ator = { id: IdDaPessoa; skin: string; x: number; y: number; giro: number; cor: string };
const ATORES: Ator[] = [
  { id: "joao", skin: "/skins/jvbs.png", x: -31, y: -10.4, giro: 0.5, cor: AZUL },
  { id: "luan", skin: "/skins/luan.png", x: 0, y: 10, giro: -0.1, cor: VIOLETA },
  { id: "ricardo", skin: "/skins/rvmm.png", x: 31, y: -10.4, giro: -0.5, cor: CARMESIM },
];

const J = CLIPES.jvbsbr;
const R = CLIPES.rvmm255;
const L = CLIPES.luan;
const suave = (k: number) => k * k * (3 - 2 * k);

// Pose de seleção: guarda para os dois combatentes e cabeça voltada para baixo no Luan (braços cruzados mantidos).
const poseSelecionada = (id: IdDaPessoa): Pose => (id === "joao" ? amostrar(J.guarda, 0.4) : id === "ricardo" ? amostrar(R.guarda, 0.4) : amostrar(L.olharParaBaixo, 0.5));

// Pose de base: durante a apresentação, a coreografia da v3; depois, repouso parado.
function poseBase(id: IdDaPessoa, t: number, feita: boolean): Pose {
  if (id === "joao") {
    if (feita) return poseNeutra();
    const p = amostrar(onda, t);
    p.rot.head[1] += Math.sin(t * 0.6) * 0.1;
    return p;
  }
  if (id === "ricardo") {
    if (feita) return poseNeutra();
    const p = amostrar(R.idle, t);
    p.rot.head[1] = 0.55 + Math.sin(t * 1.3) * 0.08;
    return p;
  }
  const p = amostrar(L.flutuar, feita ? 1 : t);
  p.pos.root[1] += Math.sin((feita ? 1 : t) * 1.8) * 1.5;
  return p;
}

export default function CenaEquipe({ aoPronto, visivel }: { aoPronto: () => void; visivel: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const camRef = useRef<CameraThree>(null);
  const jogadores = useMemo(() => ATORES.map(() => novoPlayer()), []);
  const brilho = useMemo(() => texturaDeBrilho(), []);
  const adaptadores = useRef<ReturnType<typeof vestirPlayer>[]>([]);
  const auras = useRef<(Sprite | null)[]>([null, null, null]);
  const [prontos, setProntos] = useState(false);
  const estado = useRef({ t: 0, feita: apresentadas.has("cena-equipe"), pesos: [0, 0, 0], cam: { x: 0, y: 0, z: DISTANCIA, ox: 0, oy: 0 } });

  useEffect(() => {
    let vivo = true;
    Promise.all(ATORES.map((a) => texturaDaSkin(a.skin))).then((ts) => {
      if (!vivo) return;
      adaptadores.current = ts.map((tex, i) => vestirPlayer(jogadores[i], tex));
      setProntos(true);
      aoPronto();
      invalidate();
    });
    return () => {
      vivo = false;
      brilho.dispose();
    };
    // Montagem única.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quadro em demanda: seleção e visibilidade pedem desenho.
  useEffect(() => {
    invalidate();
    return useEquipeStore.subscribe(() => invalidate());
  }, [visivel, invalidate]);

  useFrame((_, dtBruto) => {
    if (!prontos) return;
    const s = estado.current;
    const dt = Math.min(dtBruto, 0.1);
    const sel = useEquipeStore.getState().selecionada;
    let movendo = false;

    if (!s.feita && visivel && !document.hidden) {
      s.t += dt;
      if (s.t >= DURACAO_CENA / 1000) {
        s.feita = true;
        apresentadas.add("cena-equipe");
      }
      movendo = true;
    }

    const k = 1 - Math.exp(-dt / 0.12);
    ATORES.forEach((a, i) => {
      const alvo = sel === a.id ? 1 : 0;
      const d = alvo - s.pesos[i];
      if (Math.abs(d) > 0.002) {
        s.pesos[i] += d * k;
        movendo = true;
      } else s.pesos[i] = alvo;
    });

    // Câmera: até 12% mais perto e ~6° de giro rumo à pessoa selecionada; sem seleção, plano geral.
    const ator = ATORES.find((a) => a.id === sel);
    const alvoCam = ator
      ? { x: ator.x * 0.7, y: ator.y * 0.1, z: DISTANCIA * 0.9, ox: ator.x * 0.4, oy: ator.y * 0.05 }
      : { x: 0, y: 0, z: DISTANCIA, ox: 0, oy: 0 };
    (Object.keys(alvoCam) as (keyof typeof alvoCam)[]).forEach((c) => {
      const d = alvoCam[c] - s.cam[c];
      if (Math.abs(d) > 0.01) {
        s.cam[c] += d * k;
        movendo = true;
      } else s.cam[c] = alvoCam[c];
    });
    const cam = camRef.current;
    if (cam) {
      cam.position.set(s.cam.x, s.cam.y, s.cam.z);
      cam.lookAt(s.cam.ox, s.cam.oy, 0);
    }

    ATORES.forEach((a, i) => {
      const base = poseBase(a.id, s.t, s.feita);
      const w = suave(s.pesos[i]);
      adaptadores.current[i]?.aplicar(w > 0.001 ? misturar(base, poseSelecionada(a.id), w) : base);
      const aura = auras.current[i];
      if (aura) (aura.material as SpriteMaterial).opacity = 0.13 + 0.17 * w;
    });

    if (movendo) invalidate();
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault position={[0, 0, DISTANCIA]} fov={30} near={5} far={400} />
      <ambientLight intensity={3} />
      <pointLight position={[0, 20, 80]} intensity={0.6} decay={0} />
      {ATORES.map((a, i) => (
        <sprite key={`a${a.id}`} ref={(sp) => void (auras.current[i] = sp)} position={[a.x, a.y + 1, -6]} scale={[30, 48, 1]}>
          <spriteMaterial map={brilho} color={a.cor} transparent opacity={0.13} depthWrite={false} blending={AdditiveBlending} />
        </sprite>
      ))}
      {ATORES.map((a, i) => (
        <group key={a.id} position={[a.x, a.y, 0]} rotation={[0, a.giro, 0]}>
          <primitive object={jogadores[i]} visible={prontos} />
        </group>
      ))}
    </>
  );
}

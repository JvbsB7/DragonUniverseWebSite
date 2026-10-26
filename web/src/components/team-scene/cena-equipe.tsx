"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Vector3, type Group, type Mesh, type MeshBasicMaterial, type PerspectiveCamera as CameraThree, type Sprite, type SpriteMaterial } from "three";
import { texturaDeBrilho } from "@/components/cinema/brilho";
import { onda } from "@/components/cinema/clipes-site";
import { novoPlayer, texturaDaSkin, vestirPlayer } from "@/components/cinema/personagem";
import { CLIPES, amostrar, misturar, poseNeutra, type Pose } from "@/lib/personagens";
import { ATAQUES, clipeDoAtaque, type IdDoCombatente } from "@/config/ataques";
import { useEquipeStore } from "@/store/equipe";
import { DURACAO_CENA, apresentadas } from "@/store/skin-viewer";
import { aura as auraDe, type IdDaAura } from "@/lib/auras";
import type { IdDaPessoa } from "@/config/equipe";

// Vitrine da equipe (v4-03 §7.1): JvbsBR à esquerda (roxa, D31), Luan flutuando ao centro de braços cruzados (D12) e rvmm255 à direita
// (azul escura, D31). Do v3 ficam o aceno do João, o olhar do Ricardo para ele e o Luan flutuando, numa apresentação de 4 s por visita;
// depois a cena fica parada (sem rotação nem zoom livres). Selecionar uma pessoa aproxima a câmera por uma trajetória curta
// (≈ 450 ms, até 12% mais perto e ~6° de giro) e leva a pessoa à pose de seleção; os outros continuam visíveis.
const DISTANCIA = 126; // fov 30°: 67,5 unidades de altura visível, 120 de largura (palco 744 × 420)

type Ator = { id: IdDaPessoa; skin: string; x: number; y: number; giro: number; aura: IdDaAura };
const ATORES: Ator[] = [
  { id: "joao", skin: "/skins/jvbs.png", x: -31, y: -10.4, giro: 0.5, aura: "jvbsbr" },
  { id: "luan", skin: "/skins/luan.png", x: 0, y: 6, giro: -0.1, aura: "luan" },
  { id: "ricardo", skin: "/skins/rvmm.png", x: 31, y: -10.4, giro: -0.5, aura: "rvmm255" },
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
  const grupos = useRef<(Group | null)[]>([null, null, null]);
  const [prontos, setProntos] = useState(false);
  const estado = useRef({ t: 0, feita: apresentadas.has("cena-equipe"), pesos: [0, 0, 0], ataque: { id: null as IdDoCombatente | null, chave: 0, t: 0 }, cam: { x: 0, y: 0, z: DISTANCIA, ox: 0, oy: 0 } });

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

  // Raio de ki (D42): carga (esfera nas mãos que cresce), disparo (feixe que avança para fora do palco) e dissipação. Cores da aura (D31),
  // opacidades baixas e nenhuma troca súbita de brilho: sem clarão de tela inteira.
  const carga = useRef<Sprite>(null);
  const feixe = useRef<Mesh>(null);
  const nucleoFeixe = useRef<Mesh>(null);
  function desenharRaio(id: IdDoCombatente | null, t: number) {
    const c = carga.current;
    const f = feixe.current;
    const n = nucleoFeixe.current;
    if (!c || !f || !n) return;
    if (!id) {
      c.visible = f.visible = n.visible = false;
      return;
    }
    const at = ATAQUES[id];
    const ator = ATORES.find((a) => a.id === id)!;
    const cor = auraDe(ator.aura);
    const sentido = at.sentido;
    const origem = new Vector3(ator.x + sentido * 14, ator.y + 4, 3);
    const subida = 0.12; // o feixe sobe levemente: sai pelo alto do lado, longe dos outros
    // Carga: cresce de 0 a 1 até o disparo e some por inteiro em 0,3 s depois dele.
    const kc = suave(Math.min(1, t / at.disparo));
    const apaga = 1 - suave(Math.min(1, Math.max(0, (t - at.disparo) / 0.3)));
    c.visible = t < at.disparo + 0.3;
    c.position.copy(origem);
    c.scale.setScalar(2 + 7 * kc);
    const mc = c.material as SpriteMaterial;
    mc.color.set(cor.brilho);
    mc.opacity = 0.7 * kc * apaga;
    // Feixe: avança em 0,25 s, segura e se dissipa nos últimos 0,5 s.
    const dt = t - at.disparo;
    const avanco = suave(Math.min(1, Math.max(0, dt / 0.25)));
    const fim = 1 - suave(Math.min(1, Math.max(0, (t - (at.duracao - 0.5)) / 0.5)));
    const longo = 70 * avanco;
    f.visible = n.visible = dt > 0 && fim > 0.001;
    if (!f.visible) return;
    for (const [m, esp, op, cc] of [
      [f, 3.4, 0.55, cor.base],
      [n, 1.3, 0.85, cor.brilho],
    ] as const) {
      m.position.set(origem.x + (sentido * longo) / 2, origem.y + (subida * longo) / 2, origem.z);
      m.scale.set(longo, esp * (1 + 0.04 * Math.sin(t * 30)), esp);
      m.rotation.z = sentido > 0 ? Math.atan(subida) : -Math.atan(subida);
      const mm = m.material as MeshBasicMaterial;
      mm.color.set(cc);
      mm.opacity = op * fim;
    }
  }

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

    // Ataque de ki (D42): o relógio do ataque só anda com a cena visível; ao terminar, a pessoa volta à pose de seleção.
    const pedido = useEquipeStore.getState().ataque;
    if (pedido && pedido.chave !== s.ataque.chave) s.ataque = { id: pedido.id, chave: pedido.chave, t: 0 };
    else if (!pedido && s.ataque.id) s.ataque.id = null;
    if (s.ataque.id && visivel && !document.hidden) {
      s.ataque.t += dt;
      movendo = true;
      if (s.ataque.t >= ATAQUES[s.ataque.id].duracao) s.ataque.id = null;
    }
    // Só em build de QA: `window.__ataqueFixo = t` congela o ataque nesse instante (conferência dos quadros).
    if (process.env.NEXT_PUBLIC_DU_QA === "1" && s.ataque.id) {
      const fixo = (window as unknown as { __ataqueFixo?: number }).__ataqueFixo;
      if (fixo !== undefined) s.ataque.t = fixo;
    }
    desenharRaio(s.ataque.id, s.ataque.t);

    ATORES.forEach((a, i) => {
      let base = poseBase(a.id, s.t, s.feita);
      const w = suave(s.pesos[i]);
      if (s.ataque.id === a.id) {
        const at = ATAQUES[a.id as IdDoCombatente];
        const clipe = clipeDoAtaque(a.id as IdDoCombatente);
        const entra = Math.min(1, s.ataque.t / 0.2);
        const sai = Math.min(1, (at.duracao - s.ataque.t) / 0.3);
        base = misturar(poseSelecionada(a.id), amostrar(clipe, s.ataque.t % clipe.duracao), suave(Math.max(0, Math.min(entra, sai))));
      }
      // No ataque o combatente gira para o lado do raio (para fora do palco) e volta ao giro de seleção ao terminar.
      const g = grupos.current[i];
      if (g) {
        const emAtaque = s.ataque.id === a.id;
        const alvoGiro = emAtaque ? ATAQUES[a.id as IdDoCombatente].sentido * 1.45 : a.giro;
        g.rotation.y += (alvoGiro - g.rotation.y) * (1 - Math.exp(-dt / 0.1));
        if (Math.abs(alvoGiro - g.rotation.y) > 0.005) movendo = true;
      }
      adaptadores.current[i]?.aplicar(w > 0.001 ? misturar(base, poseSelecionada(a.id), s.ataque.id === a.id ? 0 : w) : base);
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
          <spriteMaterial map={brilho} color={auraDe(a.aura).halo} transparent opacity={0.13} depthWrite={false} blending={AdditiveBlending} />
        </sprite>
      ))}
      {ATORES.map((a, i) => (
        <group key={a.id} ref={(g) => void (grupos.current[ATORES.indexOf(a)] = g)} position={[a.x, a.y, 0]} rotation={[0, a.giro, 0]}>
          <primitive object={jogadores[i]} visible={prontos} />
        </group>
      ))}
      <sprite ref={carga} visible={false} renderOrder={5}>
        <spriteMaterial map={brilho} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      <mesh ref={feixe} visible={false} renderOrder={5}>
        <boxGeometry />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh ref={nucleoFeixe} visible={false} renderOrder={6}>
        <boxGeometry />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </>
  );
}

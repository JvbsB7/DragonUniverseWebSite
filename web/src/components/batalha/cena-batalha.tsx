"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  InstancedMesh,
  Object3D,
  PerspectiveCamera as CameraThree,
  Sprite,
  SpriteMaterial,
  type Group,
  type Mesh,
} from "three";
import { texturaDeBrilho } from "@/components/cinema/brilho";
import { novoPlayer, texturaDaSkin, vestirPlayer } from "@/components/cinema/personagem";
import { SKINS } from "@/lib/personagens";
import { useQualidade } from "@/lib/use-qualidade";
import { degradar } from "@/lib/perfil";
import { aura as auraDe } from "@/lib/auras";
import { parametroQA } from "@/lib/qa";
import { DURACAO_BATALHA, relogioBatalha, useBatalhaStore } from "@/store/batalha";
import {
  CORES,
  GRAVIDADE,
  anel,
  aura,
  camera as cameraEm,
  combatenteGiro,
  combatenteY,
  criarParticulas,
  joaoX,
  linhasDeVelocidade,
  luanVisivel,
  luanY,
  nucleoDeImpacto,
  PUNHOS_DY,
  poseJoao,
  poseLuan,
  poseRicardo,
  ricardoX,
  suave,
} from "./batalha-linha";

// Quadro de teste (só em build de QA, NEXT_PUBLIC_DU_QA=1): `?batalha-quadro=4.5` congela a cena nesse instante (pôster, QA e revisão de efeitos).
const quadroDeTeste = process.env.NEXT_PUBLIC_DU_QA === "1" ? parametroQA("batalha-quadro") : null;

function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Campo rochoso voxel procedural e original (D5): placas de chão e rochas em blocos, em azul-marinho da paleta.
function Campo() {
  const chao = useRef<InstancedMesh>(null);
  const rochas = useRef<InstancedMesh>(null);
  useEffect(() => {
    const r = prng(11);
    const o = new Object3D();
    const cor = new Color();
    const paleta = ["#0a1530", "#0c1833", "#0b1630", "#0d1a36"];
    let n = 0;
    for (let x = -14; x <= 13; x++) {
      for (let z = -7; z <= 4; z++) {
        const h = 2 + (r() < 0.12 ? 1 : 0);
        o.position.set(x * 8 + 4, -16 - h / 2, z * 8 + 4);
        o.scale.set(8, h, 8);
        o.updateMatrix();
        chao.current?.setMatrixAt(n, o.matrix);
        chao.current?.setColorAt(n, cor.set(paleta[Math.floor(r() * paleta.length)]));
        n++;
      }
    }
    if (chao.current) chao.current.instanceMatrix.needsUpdate = true;
    if (chao.current?.instanceColor) chao.current.instanceColor.needsUpdate = true;
    const tons = ["#152850", "#182d58", "#13244a", "#1a3160"];
    let m = 0;
    const aglomerado = (cx: number, cz: number, qtd: number, grande: number) => {
      for (let i = 0; i < qtd; i++) {
        const w = 4 + r() * grande;
        const h = 4 + r() * grande * 1.6;
        o.position.set(cx + (r() - 0.5) * 22, -16 + h / 2, cz + (r() - 0.5) * 12);
        o.scale.set(w, h, w * (0.7 + r() * 0.6));
        o.updateMatrix();
        rochas.current?.setMatrixAt(m, o.matrix);
        rochas.current?.setColorAt(m, cor.set(tons[Math.floor(r() * tons.length)]));
        m++;
      }
    };
    // Horizonte (D33): cinco mesas/pilares escalonados em duas profundidades, só nas laterais; o vão central fica livre para o contato e o Luan.
    // Fundo escuro e desaturado; o plano próximo leva um recorte azul discreto no topo.
    const fundo = ["#0b1530", "#0e1a38", "#122344"];
    const massa = (cx: number, cz: number, larg: number, alt: number, degraus: number, tons: string[]) => {
      for (let d = 0; d < degraus; d++) {
        const w = larg * (1 - d * 0.22);
        const h = (alt / degraus) * (d + 1);
        o.position.set(cx + (d % 2 ? 1.5 : -1.5), -16 + h / 2, cz);
        o.scale.set(w, h, w * 0.8);
        o.updateMatrix();
        rochas.current?.setMatrixAt(m, o.matrix);
        rochas.current?.setColorAt(m, cor.set(tons[Math.min(d, tons.length - 1)]));
        m++;
      }
    };
    massa(-96, -70, 34, 46, 3, fundo);
    massa(112, -66, 34, 30, 2, fundo);
    massa(-62, -48, 22, 36, 4, fundo);
    massa(78, -52, 24, 17, 3, fundo);
    massa(-118, -30, 26, 30, 3, ["#13244a", "#172b55", "#1c3361"]);
    aglomerado(-82, -10, 5, 7);
    aglomerado(98, -12, 4, 4);
    aglomerado(-100, 6, 3, 5);
    aglomerado(100, 6, 3, 5);
    if (rochas.current) rochas.current.count = m;
    if (rochas.current) rochas.current.instanceMatrix.needsUpdate = true;
    if (rochas.current?.instanceColor) rochas.current.instanceColor.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={chao} args={[undefined, undefined, 28 * 12]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh ref={rochas} args={[undefined, undefined, 90]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
    </>
  );
}

const PARTICULAS = criarParticulas();

export default function CenaBatalha({ aoPronto, visivel }: { aoPronto: () => void; visivel: boolean }) {
  const nivel = useQualidade();
  const invalidate = useThree((s) => s.invalidate);
  const camRef = useRef<CameraThree>(null);
  const grupos = useRef<(Group | null)[]>([null, null, null]);
  const adaptadores = useRef<ReturnType<typeof vestirPlayer>[]>([]);
  const [prontos, setProntos] = useState(false);
  const jogadores = useMemo(() => [novoPlayer(), novoPlayer(), novoPlayer()], []);
  const brilho = useMemo(() => texturaDeBrilho(), []);
  const auras = useRef<(Sprite | null)[]>([null, null]);
  const nucleo = useRef<Sprite>(null);
  const haloLuan = useRef<Sprite>(null);
  const linhas = useRef<(Mesh | null)[]>([]);
  const aneis = useRef<(Mesh | null)[]>([null, null]);
  const parts = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const acumulado = useRef(0);

  useEffect(() => {
    let vivo = true;
    Promise.all([SKINS.jvbsbr, SKINS.rvmm255, SKINS.luan].map(texturaDaSkin)).then((ts) => {
      if (!vivo) return;
      adaptadores.current = ts.map((tex, i) => vestirPlayer(jogadores[i], tex));
      if (parts.current) PARTICULAS.forEach((p, i) => parts.current!.setColorAt(i, new Color(p.cor)));
      if (parts.current?.instanceColor) parts.current.instanceColor.needsUpdate = true;
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

  // Frame em demanda: qualquer mudança de estado (iniciar, pausar, pular) ou de visibilidade pede um novo quadro.
  useEffect(() => {
    invalidate();
    return useBatalhaStore.subscribe(() => invalidate());
  }, [visivel, invalidate]);

  useEffect(() => {
    if (quadroDeTeste !== null) relogioBatalha.t = parseFloat(quadroDeTeste) || 0;
  }, []);

  function desenhar(t: number, nv: string) {
    const [gj, gr, gl] = grupos.current;
    const giro = combatenteGiro(t);
    const yc = combatenteY(t);
    const xj = joaoX(t);
    const xr = ricardoX(t);
    gj?.position.set(xj, yc, 0);
    if (gj) gj.rotation.y = giro;
    gr?.position.set(xr, yc, 0);
    if (gr) gr.rotation.y = -giro;
    adaptadores.current[0]?.aplicar(poseJoao(t));
    adaptadores.current[1]?.aplicar(poseRicardo(t));
    const pl = poseLuan(t);
    // Cabeça de Luan desce de leve ao observar (6,65–7,45 s), mantendo os braços cruzados do clipe.
    pl.rot.head[0] += 0.22 * suave((t - 6.65) / 0.8);
    adaptadores.current[2]?.aplicar(pl);
    if (haloLuan.current) {
      haloLuan.current.visible = luanVisivel(t);
      haloLuan.current.position.set(0, luanY(t) + 1, -6);
      (haloLuan.current.material as SpriteMaterial).opacity = 0.24 * suave((t - 6.0) / 1.4);
    }
    if (gl) {
      gl.visible = luanVisivel(t);
      gl.position.set(0, luanY(t), 0);
      gl.rotation.y = -0.1;
    }

    // Tremor só no nível alto; médio sem tremor, borrão ou refração (v4-03 §12.1).
    const cam = cameraEm(t, nv === "alto");
    const c = camRef.current;
    if (c) {
      c.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      c.fov = cam.fov;
      c.lookAt(cam.olha[0], cam.olha[1], cam.olha[2]);
      c.updateProjectionMatrix();
    }

    // Auras (sprites aditivos atrás de cada combatente).
    const posAura: [number, number][] = [[xj, yc], [xr, yc]];
    auras.current.forEach((s, i) => {
      if (!s) return;
      s.position.set(posAura[i][0], posAura[i][1] + 1, -5);
      // O azul escuro do rvmm255 (D31) é tênue sozinho: o halo dele usa o brilho claro e ganha um reforço de 60%.
      (s.material as SpriteMaterial).opacity = aura(t, i as 0 | 1) * (i === 1 ? 1.6 : 1);
    });

    // Realce de impacto e anéis de onda no chão.
    const k = nucleoDeImpacto(t);
    if (nucleo.current) {
      nucleo.current.visible = k > 0;
      nucleo.current.position.set(0, yc + PUNHOS_DY, 6);
      nucleo.current.scale.setScalar(2 + 8 * k);
      (nucleo.current.material as SpriteMaterial).opacity = 0.85 * k;
    }
    aneis.current.forEach((m, i) => {
      if (!m) return;
      const a = anel(t, i * 0.12);
      m.visible = !!a && (i === 0 || nv === "alto");
      if (a) {
        m.scale.setScalar(a.raio);
        (m.material as SpriteMaterial).opacity = a.opacidade * (i ? 0.45 : 1);
      }
    });

    // Linhas de velocidade (rastros geométricos curtos atrás dos corpos).
    const p = linhasDeVelocidade(t);
    linhas.current.forEach((m, i) => {
      if (!m) return;
      const porLado = nv === "alto" ? 3 : 1;
      const lado = i < 3 ? 0 : 1;
      const idx = i % 3;
      m.visible = p !== null && idx < porLado;
      if (p === null || !m.visible) return;
      const sinal = lado === 0 ? -1 : 1;
      const base = lado === 0 ? xj : xr;
      const comp = 6 + 12 * p;
      m.scale.set(comp, 0.35, 0.35);
      m.position.set(base + sinal * (7 + idx * 3 + comp / 2), yc + [5, -1, -8][idx], [2, -2, 3][idx]);
      (m.material as SpriteMaterial).opacity = 0.55 * (1 - 0.4 * p);
    });

    // Partículas (impacto e fragmentos só até o limite do nível; ambientais 8/4).
    const im = parts.current;
    if (im) {
      PARTICULAS.forEach((pt, i) => {
        const tau = t - pt.nasce;
        let ativa = tau >= 0 && tau <= pt.vida;
        if (pt.tipo === "ambiente") ativa = nv === "alto" || i < 22 + 4;
        if (pt.tipo === "energia" && nv !== "alto" && i >= 20) ativa = false;
        if (pt.tipo === "impacto" && nv !== "alto" && i >= 8) ativa = false;
        if (pt.tipo === "fragmento" && nv !== "alto" && i >= 12 + 3) ativa = false;
        if (!ativa) {
          dummy.scale.setScalar(0);
        } else if (pt.tipo === "ambiente") {
          dummy.position.set(pt.p0[0] + Math.sin(t * 0.3 + i) * 3, pt.p0[1] + Math.sin(t * 0.5 + i * 2) * 2, pt.p0[2]);
          dummy.scale.setScalar(pt.escala);
        } else {
          const g = pt.tipo === "energia" ? 0 : GRAVIDADE;
          const y = Math.max(pt.p0[1] + pt.v[1] * tau - 0.5 * g * tau * tau, -15.5);
          dummy.position.set(pt.p0[0] + pt.v[0] * tau, y, pt.p0[2] + pt.v[2] * tau);
          dummy.scale.setScalar(pt.escala * (1 - 0.6 * (tau / pt.vida)));
        }
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    }
  }

  // Monitor de quadros (v4-03 §12.1): média acima de 100 ms por 3 s seguidos desce um nível de qualidade (nunca sobe na ação).
  const janela = useRef({ soma: 0, n: 0, ruins: 0 });
  function vigiarQuadros(dt: number) {
    // Quadro depois de aba oculta ou rolagem longa não conta como lentidão.
    if (dt > 1) return;
    const j = janela.current;
    j.soma += dt;
    j.n += 1;
    if (j.soma < 1.5) return;
    j.ruins = j.soma / j.n > 0.1 ? j.ruins + 1 : 0;
    j.soma = 0;
    j.n = 0;
    if (j.ruins >= 2) {
      j.ruins = 0;
      degradar();
    }
  }

  useFrame((_, dtBruto) => {
    if (!prontos) return;
    const st = useBatalhaStore.getState();
    const rel = relogioBatalha;
    if (quadroDeTeste === null && rel.rodada !== st.rodada) {
      rel.rodada = st.rodada;
      rel.t = st.status === "tocando" ? 0 : DURACAO_BATALHA;
    }
    // Avança só enquanto a região está na tela, a aba visível e sem pausa; o quadro nunca pula segundos acumulados.
    const rodando = quadroDeTeste === null && visivel && !document.hidden && !st.pausada && st.status !== "parado";
    if (rodando) {
      const dt = Math.min(dtBruto, 0.25);
      vigiarQuadros(dtBruto);
      if (st.status === "repouso") {
        // Repouso: ~30 quadros por segundo bastam para respiração e auras.
        acumulado.current += dt;
        if (acumulado.current < 1 / 30) {
          invalidate();
          return;
        }
        rel.t += acumulado.current;
        acumulado.current = 0;
      } else {
        rel.t += dt;
        if (rel.t >= DURACAO_BATALHA) st.terminou();
      }
      invalidate();
    }
    if (process.env.NEXT_PUBLIC_DU_QA === "1") (window as unknown as { __bt?: number }).__bt = rel.t;
    desenhar(rel.t, nivel);
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault position={[0, 6, 80]} fov={45} near={5} far={400} />
      <fog attach="fog" args={["#0a1328", 120, 230]} />
      <ambientLight intensity={2.2} />
      {/* Luz de borda: roxa à esquerda (JvbsBR), azul à direita (rvmm255), dourada de contraluz para o Luan (v4-03 §2.1, §4; D31). */}
      <directionalLight position={[-60, 20, 30]} intensity={1.0} color={auraDe("jvbsbr").base} />
      <directionalLight position={[60, 20, 30]} intensity={0.9} color={auraDe("rvmm255").halo} />
      <directionalLight position={[0, 60, -40]} intensity={0.7} color={auraDe("luan").base} />
      {/* Luz de recorte só nas bordas (v4-10 M2; D31): brilho roxo atrás do JvbsBR, brilho azul atrás do rvmm255 (o azul escuro precisa da borda clara). */}
      <directionalLight position={[-45, 18, -55]} intensity={1.3} color={auraDe("jvbsbr").brilho} />
      <directionalLight position={[45, 18, -55]} intensity={1.6} color={auraDe("rvmm255").brilho} />
      <Campo />

      {[0, 1].map((i) => (
        <sprite key={`a${i}`} ref={(s) => void (auras.current[i] = s)} scale={[34, 54, 1]} renderOrder={-1}>
          <spriteMaterial map={brilho} color={auraDe(i === 0 ? "jvbsbr" : "rvmm255").halo} transparent opacity={0.19} depthWrite={false} blending={AdditiveBlending} />
        </sprite>
      ))}

      <group ref={(g) => void (grupos.current[0] = g)}>
        <primitive object={jogadores[0]} visible={prontos} />
      </group>
      <group ref={(g) => void (grupos.current[1] = g)}>
        <primitive object={jogadores[1]} visible={prontos} />
      </group>
      <group ref={(g) => void (grupos.current[2] = g)} visible={false}>
        <primitive object={jogadores[2]} visible={prontos} />
      </group>

      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`l${i}`} ref={(m) => void (linhas.current[i] = m)} visible={false}>
          <boxGeometry />
          <meshBasicMaterial color={i < 3 ? CORES.ciano : auraDe("rvmm255").brilho} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      <sprite ref={haloLuan} scale={[36, 56, 1]} visible={false}>
        <spriteMaterial map={brilho} color={auraDe("luan").base} transparent opacity={0.24} depthWrite={false} blending={AdditiveBlending} />
      </sprite>

      <sprite ref={nucleo} position={[0, 7, 5]} visible={false}>
        <spriteMaterial map={brilho} color={CORES.ciano} transparent opacity={0.8} depthWrite={false} blending={AdditiveBlending} />
      </sprite>

      {[0, 1].map((i) => (
        <mesh key={`r${i}`} ref={(m) => void (aneis.current[i] = m)} rotation={[-Math.PI / 2, 0, 0]} position={[0, -15.7 + i * 0.05, -2]} visible={false}>
          <ringGeometry args={[0.965, 1, 64]} />
          <meshBasicMaterial color={CORES.ciano} transparent opacity={0.3} side={DoubleSide} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      <instancedMesh ref={parts} args={[undefined, undefined, PARTICULAS.length]} frustumCulled={false} renderOrder={10}>
        <boxGeometry />
        {/* Desenhadas depois dos brilhos aditivos: a mistura do núcleo ciano com a aura azul clareava as partículas para rosa. */}
        <meshBasicMaterial toneMapped={false} transparent depthWrite={false} />
      </instancedMesh>
    </>
  );
}

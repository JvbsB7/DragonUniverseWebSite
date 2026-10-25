/**
 * Logo 3D do hero (v3, direção B empilhada): extrusão dos glifos de `public/img/logo/dragon-universe-b-empilhado.svg`
 * (viewBox 90×40), com a mesma inclinação (matriz 1 0 .12 1) e o raio de ki do SVG. Não há fetch: os contornos abaixo são
 * os mesmos paths do arquivo, numa grade de 8×12. A frente usa o degradê do logo (#1674ff → #3fbbfe por glifo) e as
 * laterais, o azul-marinho da profundidade. Sem halo: o brilho do 2D já vem do próprio SVG.
 *
 * A cena devolvida entra como filha da cena do R3F, sem renderer nem câmera. Altura do logo = 2 unidades.
 */

import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const GLIFOS: Record<string, string> = {
  D: "M0 0H6V1H7V2H8V10H7V11H6V12H0ZM2 2V10H5V9H6V3H5V2Z",
  R: "M0 0H6V1H8V6H6V8H7V10H8V12H5V10H4V8H2V12H0ZM2 2V5H6V2Z",
  A: "M2 0H6V1H7V3H8V12H6V8H2V12H0V3H1V1H2ZM2 3V6H6V3H5V2H3V3Z",
  G: "M1 0H8V2H2V10H6V7H4V5H8V12H1V11H0V1H1Z",
  O: "M1 0H7V1H8V11H7V12H1V11H0V1H1ZM2 2V10H6V2Z",
  N: "M0 0H4V4H5V6H6V0H8V12H5V8H4V6H3V4H2V12H0Z",
  U: "M0 0H2V9H3V10H5V9H6V0H8V10H7V11H6V12H2V11H1V10H0Z",
  I: "M1 0H7V2H5V10H7V12H1V10H3V2H1Z",
  V: "M0 0H2V4H3V7H4V9H5V7H6V4V0H8V5H7V8H6V10H5V12H3V10H2V8H1V5H0Z",
  E: "M0 0H8V2H2V5H7V7H2V10H8V12H0Z",
  S: "M1 0H8V2H2V5H7V6H8V11H7V12H0V10H6V7H1V6H0V1H1Z",
};

const LINHAS = [
  { texto: "DRAGON", x: 14, y: 4 },
  { texto: "UNIVERSE", x: 4, y: 23 },
];
const CISALHAMENTO = 0.12;
const VIEWBOX = { w: 90, h: 40 };
const PROFUNDIDADE = 3.2;
const RAIO_PRETO = "M31 18H49L47 19H62L53 23H35L37 22H22Z";
const RAIO_OURO = "M32 19H47L44 20H58L52 22H37L40 21H26Z";

export type CenaDoLogo = {
  cena: THREE.Scene;
  grupo: THREE.Group;
  halo: THREE.Sprite | null;
  /** Largura do logo em unidades da cena (altura = 2). */
  largura: number;
  liberar: () => void;
};

/** Largura/altura do viewBox: o hero usa para ajustar o zoom da câmera. */
export const PROPORCAO_LOGO = VIEWBOX.w / VIEWBOX.h;

function formas(d: string, transform: string): THREE.Shape[] {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path transform="${transform}" d="${d}"/></svg>`;
  return new SVGLoader().parse(svg).paths.flatMap((p) => p.toShapes());
}

function pintarDegrade(geo: THREE.BufferGeometry, y0: number) {
  const topo = new THREE.Color("#1674ff");
  const meio = new THREE.Color("#2d86eb");
  const base = new THREE.Color("#3fbbfe");
  const pos = geo.getAttribute("position");
  const cores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(Math.max((pos.getY(i) - y0) / 12, 0), 1);
    if (t < 0.45) c.lerpColors(topo, meio, t / 0.45);
    else c.lerpColors(meio, base, (t - 0.45) / 0.55);
    cores.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cores, 3));
}

export async function carregarCenaDoLogo(): Promise<CenaDoLogo> {
  const geometrias: THREE.BufferGeometry[] = [];
  const materiais: THREE.Material[] = [];
  const material = <T extends THREE.Material>(m: T) => {
    materiais.push(m);
    return m;
  };
  const frente = material(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
  const lateral = material(new THREE.MeshStandardMaterial({ color: "#1b2a6b", roughness: 0.8, metalness: 0.02 }));
  const preto = material(new THREE.MeshBasicMaterial({ color: "#060a16" }));
  const ouro = material(new THREE.MeshBasicMaterial({ color: "#f6b943", toneMapped: false }));

  const conteudo = new THREE.Group();
  const extrudar = (fs: THREE.Shape[], profundidade: number, z: number, mats: THREE.Material | THREE.Material[], y0?: number) => {
    for (const f of fs) {
      const geo = new THREE.ExtrudeGeometry(f, { depth: profundidade, bevelEnabled: false });
      if (y0 !== undefined) pintarDegrade(geo, y0);
      geometrias.push(geo);
      const mesh = new THREE.Mesh(geo, mats);
      mesh.position.z = z;
      conteudo.add(mesh);
      // Contorno escuro do SVG: cópia deslocada atrás da letra (só para as letras).
      if (y0 !== undefined) {
        const sombra = new THREE.Mesh(geo, preto);
        sombra.position.set(0.9, 0.9, z - 0.05);
        conteudo.add(sombra);
      }
    }
  };

  for (const linha of LINHAS) {
    [...linha.texto].forEach((letra, i) => {
      const tr = `translate(${linha.x} ${linha.y}) matrix(1 0 ${CISALHAMENTO} 1 0 0) translate(${i * 10} 0)`;
      extrudar(formas(GLIFOS[letra], tr), PROFUNDIDADE, 0, [frente, lateral], linha.y);
    });
  }
  extrudar(formas(RAIO_PRETO, ""), 0.3, PROFUNDIDADE + 0.05, preto);
  extrudar(formas(RAIO_OURO, ""), 0.3, PROFUNDIDADE + 0.4, ouro);

  // O SVG tem y para baixo: o espelhamento fica no grupo, e o centro do viewBox vai para a origem.
  const escala = 2 / VIEWBOX.h;
  conteudo.scale.set(escala, -escala, escala);
  conteudo.position.set((-VIEWBOX.w / 2) * escala, (VIEWBOX.h / 2) * escala, (-PROFUNDIDADE / 2) * escala);
  const grupo = new THREE.Group();
  grupo.add(conteudo);

  const cena = new THREE.Scene();
  cena.add(grupo);
  const ambiente = new THREE.HemisphereLight("#FFFFFF", "#263B57", 1.5);
  const principal = new THREE.DirectionalLight("#FFFFFF", 1.8);
  principal.position.set(-3, 4, 8);
  const preenchimento = new THREE.DirectionalLight("#70C9FF", 0.45);
  preenchimento.position.set(4, 0, 5);
  cena.add(ambiente, principal, preenchimento);

  return {
    cena,
    grupo,
    halo: null,
    largura: PROPORCAO_LOGO * 2,
    liberar: () => {
      geometrias.forEach((g) => g.dispose());
      materiais.forEach((m) => m.dispose());
    },
  };
}

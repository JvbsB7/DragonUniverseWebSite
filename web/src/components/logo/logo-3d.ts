/**
 * Logo 3D do hero, adaptado de entregas/v2-04-design/logo/logo-3d-referencia.ts (R5), three 0.186.1.
 *
 * Mudanças em relação à referência (QA de design, rodada 2):
 * - R2-B3b: a vaga do canvas só é reservada depois de o SVG ter sido baixado e interpretado (e o componente só
 *   chama este módulo depois de checar o WebGL). Sem vaga, nada é criado e o fallback continua na tela.
 * - R2-B5: `webglcontextlost` leva ao fallback e `webglcontextrestored` volta ao 3D; se o contexto não voltar em 3 s, a tentativa é encerrada.
 * - `jaInteragiu`: o componente já esperou a primeira interação antes de importar este módulo.
 * - `liberar()`: devolve a vaga (por exemplo, quando outra cena a toma) sem marcar falha.
 * - "Já apresentado" vale para a visita inteira (nível do módulo), então reentrar na tela não repete a entrada.
 *
 * Não cria controles, não recebe foco e não altera o SVG de origem.
 */

import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

type Camada = "outline" | "side" | "face" | "highlight";

type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Parada = {
  offset: number;
  /** Canais sRGB, antes da conversão para luz linear. */
  rgb: [number, number, number];
};

type Gradiente = {
  y0: number;
  y1: number;
  paradas: Parada[];
};

type Recursos = {
  geometrias: Set<THREE.BufferGeometry>;
  materiais: Set<THREE.Material>;
  texturas: Set<THREE.Texture>;
};

type Tentativa = Recursos & {
  abort: AbortController;
  liberarVaga: () => void;
  cena: THREE.Scene;
  grupo: THREE.Group;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer | null;
  halo: THREE.Sprite | null;
  viewBox: ViewBox | null;
  raf: number;
  aoPerderContexto: ((event: Event) => void) | null;
  aoRestaurarContexto: (() => void) | null;
  timerContexto: number;
  contextoPerdido: boolean;
};

export type OpcoesLogo3D = {
  container: HTMLElement;

  /**
   * Imagem já presente no HTML inicial. Não depender deste módulo
   * para criar o primeiro conteúdo visível.
   */
  fallback: HTMLImageElement;

  /** URL do SVG otimizado que contém as quatro camadas. */
  svgUrl: string;

  /** Ex.: /img/logo/export/logo-dragon-universe-640.png */
  pngFallbackUrl: string;

  /**
   * Deve consultar o pool compartilhado com as skins.
   * Retorna uma função de liberação, ou null quando não há vaga.
   * Nunca permitir mais de dois canvases vivos no conjunto do site.
   */
  reservarCanvas: () => (() => void) | null;

  /** Registro interno; não precisa produzir aviso ou interface pública. */
  aoFalhar?: (erro: Error) => void;

  /** A primeira interação com a página já aconteceu antes de montar. */
  jaInteragiu?: boolean;
};

export type ControleLogo3D = {
  /** Reavaliar visibilidade, preferência e disponibilidade de vaga. */
  tentarNovamente: () => void;
  /** Devolve a vaga e volta ao fallback, sem marcar falha (outra cena pediu o canvas). */
  liberar: () => void;
  /** Chamar ao desmontar a página ou o componente. */
  destruir: () => void;
};

const CONFIG: Record<
  Camada,
  { z: number; profundidade: number; parede: string; rugosidade: number; metal: number }
> = {
  outline: {
    z: 0,
    profundidade: 10,
    parede: "#000000",
    rugosidade: 1,
    metal: 0,
  },
  side: {
    z: 9.75,
    profundidade: 7,
    parede: "#101B48",
    rugosidade: 0.85,
    metal: 0.02,
  },
  face: {
    z: 16.5,
    profundidade: 1.8,
    parede: "#1B2A6B",
    rugosidade: 0.72,
    metal: 0.06,
  },
  highlight: {
    z: 18.1,
    profundidade: 0.25,
    parede: "#70C9FF",
    rugosidade: 0.55,
    metal: 0,
  },
};

const ORDEM: Camada[] = ["outline", "side", "face", "highlight"];
const DURACAO_ENTRADA = 1800;
const ESPERA_CONTEXTO = 3000;

// A entrada acontece uma vez por visita, mesmo se o componente for desmontado e montado de novo.
let animacaoConsumida = false;

function erroDe(valor: unknown): Error {
  return valor instanceof Error ? valor : new Error(String(valor));
}

function propriedade(elemento: Element, nome: string): string | null {
  const style = elemento.getAttribute("style") ?? "";
  for (const declaracao of style.split(";")) {
    const indice = declaracao.indexOf(":");
    if (indice < 0) continue;
    if (declaracao.slice(0, indice).trim() === nome) {
      return declaracao.slice(indice + 1).trim();
    }
  }
  return elemento.getAttribute(nome);
}

function numeroFinito(valor: string, descricao: string): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    throw new Error(`Valor inválido em ${descricao}.`);
  }
  return numero;
}

function lerViewBox(svg: Element): ViewBox {
  const partes = (svg.getAttribute("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (
    partes.length !== 4 ||
    partes.some(valor => !Number.isFinite(valor)) ||
    partes[2] <= 0 ||
    partes[3] <= 0
  ) {
    throw new Error("O logo precisa de um viewBox válido.");
  }

  const [x, y, width, height] = partes;
  if (Math.abs(width / height - 1934 / 187) > 0.001) {
    throw new Error("A proporção do SVG diverge da marca horizontal informada.");
  }
  return { x, y, width, height };
}

function nomeDaCamada(id: string): Camada | null {
  return ORDEM.find(nome => id.endsWith(`-${nome}`)) ?? null;
}

function validarDocumento(doc: XMLDocument): Element {
  if (doc.querySelector("parsererror")) {
    throw new Error("Não foi possível interpretar o SVG.");
  }

  const svg = doc.documentElement;
  if (svg.localName !== "svg") {
    throw new Error("A entrada não é um SVG.");
  }

  if (doc.querySelector("script,foreignObject,image,use,style")) {
    throw new Error("O SVG contém recursos fora do contrato desta referência.");
  }

  for (const elemento of Array.from(doc.querySelectorAll("*"))) {
    const filtro = elemento.getAttribute("filter");
    const mascara = elemento.getAttribute("mask");
    const recorte = elemento.getAttribute("clip-path");

    if (filtro || mascara || recorte) {
      throw new Error("Filtros, máscaras e recortes exigem adaptação específica.");
    }
  }
  return svg;
}

function coordenada(
  raw: string,
  unidades: string,
  eixo: "x" | "y",
  caixa: THREE.Box3,
  viewBox: ViewBox,
): number {
  const texto = raw.trim();
  const porcentagem = texto.endsWith("%");
  const valor = numeroFinito(
    porcentagem ? texto.slice(0, -1) : texto,
    "coordenada de gradiente",
  );

  const minimo = eixo === "x" ? caixa.min.x : caixa.min.y;
  const extensao =
    eixo === "x" ? caixa.max.x - caixa.min.x : caixa.max.y - caixa.min.y;

  if (unidades === "objectBoundingBox") {
    return minimo + (porcentagem ? valor / 100 : valor) * extensao;
  }

  if (unidades !== "userSpaceOnUse") {
    throw new Error("Unidade de gradiente não reconhecida.");
  }

  if (!porcentagem) return valor;

  const origem = eixo === "x" ? viewBox.x : viewBox.y;
  const tamanho = eixo === "x" ? viewBox.width : viewBox.height;
  return origem + (valor / 100) * tamanho;
}

function lerGradiente(
  doc: XMLDocument,
  id: string,
  caixa: THREE.Box3,
  viewBox: ViewBox,
): Gradiente {
  const elemento = Array.from(doc.querySelectorAll("[id]")).find(
    candidato => candidato.id === id,
  );

  if (!elemento || elemento.localName !== "linearGradient") {
    throw new Error(`Gradiente linear ausente: ${id}.`);
  }

  if (
    elemento.hasAttribute("href") ||
    elemento.hasAttribute("xlink:href") ||
    elemento.hasAttribute("gradientTransform")
  ) {
    throw new Error(
      "Esta referência exige gradientes completos, sem herança ou gradientTransform.",
    );
  }

  if ((elemento.getAttribute("spreadMethod") ?? "pad") !== "pad") {
    throw new Error("Esta referência implementa somente spreadMethod pad.");
  }

  const unidades = elemento.getAttribute("gradientUnits") ?? "objectBoundingBox";

  const x0 = coordenada(
    elemento.getAttribute("x1") ?? "0%",
    unidades,
    "x",
    caixa,
    viewBox,
  );
  const x1 = coordenada(
    elemento.getAttribute("x2") ?? "100%",
    unidades,
    "x",
    caixa,
    viewBox,
  );
  const y0 = coordenada(
    elemento.getAttribute("y1") ?? "0%",
    unidades,
    "y",
    caixa,
    viewBox,
  );
  const y1 = coordenada(
    elemento.getAttribute("y2") ?? "0%",
    unidades,
    "y",
    caixa,
    viewBox,
  );

  if (Math.abs(x1 - x0) > 0.001 || Math.abs(y1 - y0) < 0.001) {
    throw new Error("O gradiente precisa ser vertical e ter extensão não nula.");
  }

  const paradas: Parada[] = Array.from(elemento.children)
    .filter(filho => filho.localName === "stop")
    .map(stop => {
      const rawOffset = (stop.getAttribute("offset") ?? "0").trim();
      const porcentagem = rawOffset.endsWith("%");
      const offset = numeroFinito(
        porcentagem ? rawOffset.slice(0, -1) : rawOffset,
        "parada do gradiente",
      ) / (porcentagem ? 100 : 1);

      const opacidade = numeroFinito(
        propriedade(stop, "stop-opacity") ?? "1",
        "opacidade da parada",
      );
      const corCSS = propriedade(stop, "stop-color");

      if (!corCSS || opacidade !== 1) {
        throw new Error("As paradas precisam de cor explícita e opacidade 1.");
      }

      /*
       * As paradas descritas pelo Coordinator são hexadecimais.
       * Recusar outras sintaxes evita aceitar currentColor ou cor inválida
       * silenciosamente. Ampliar o parser se o XML real exigir.
       */
      if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(corCSS)) {
        throw new Error("Esta referência espera cores hexadecimais nas paradas.");
      }

      const cor = new THREE.Color(corCSS).convertLinearToSRGB();
      return {
        offset: THREE.MathUtils.clamp(offset, 0, 1),
        rgb: [cor.r, cor.g, cor.b] as [number, number, number],
      };
    });

  if (paradas.length < 2) {
    throw new Error("O gradiente precisa de pelo menos duas paradas.");
  }

  for (let i = 1; i < paradas.length; i += 1) {
    if (paradas[i].offset < paradas[i - 1].offset) {
      throw new Error("As paradas precisam estar em ordem crescente.");
    }
  }

  return { y0, y1, paradas };
}

function criarRampa(paradas: Parada[], recursos: Recursos): THREE.DataTexture {
  const largura = 1024;
  const dados = new Uint8Array(largura * 4);

  for (let x = 0; x < largura; x += 1) {
    const t = x / (largura - 1);
    let esquerda = paradas[0];
    let direita = paradas[paradas.length - 1];

    if (t <= paradas[0].offset) {
      direita = esquerda;
    } else if (t >= paradas[paradas.length - 1].offset) {
      esquerda = direita;
    } else {
      for (let i = 0; i < paradas.length - 1; i += 1) {
        if (t >= paradas[i].offset && t < paradas[i + 1].offset) {
          esquerda = paradas[i];
          direita = paradas[i + 1];
          break;
        }
      }
    }

    const distancia = direita.offset - esquerda.offset;
    const fator = distancia > 0 ? (t - esquerda.offset) / distancia : 0;

    for (let canal = 0; canal < 3; canal += 1) {
      const valor = THREE.MathUtils.lerp(
        esquerda.rgb[canal],
        direita.rgb[canal],
        THREE.MathUtils.clamp(fator, 0, 1),
      );
      dados[x * 4 + canal] = Math.round(valor * 255);
    }
    dados[x * 4 + 3] = 255;
  }

  const textura = new THREE.DataTexture(
    dados,
    largura,
    1,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );

  /*
   * Mantemos os bytes sRGB sem decodificação automática.
   * O shader abaixo faz a conversão explicitamente uma única vez.
   */
  textura.colorSpace = THREE.NoColorSpace;
  textura.minFilter = THREE.LinearFilter;
  textura.magFilter = THREE.LinearFilter;
  textura.wrapS = THREE.ClampToEdgeWrapping;
  textura.wrapT = THREE.ClampToEdgeWrapping;
  textura.generateMipmaps = false;
  textura.needsUpdate = true;
  recursos.texturas.add(textura);
  return textura;
}

function materialPlano(
  cor: string,
  camada: Camada,
  recursos: Recursos,
): THREE.MeshStandardMaterial {
  const config = CONFIG[camada];
  const material = new THREE.MeshStandardMaterial({
    color: cor,
    roughness: config.rugosidade,
    metalness: config.metal,
  });
  recursos.materiais.add(material);
  return material;
}

function materialGradiente(
  gradiente: Gradiente,
  camada: Camada,
  recursos: Recursos,
): THREE.MeshStandardMaterial {
  const material = materialPlano("#FFFFFF", camada, recursos);
  const rampa = criarRampa(gradiente.paradas, recursos);

  material.onBeforeCompile = shader => {
    const inicioVertice = "#include <begin_vertex>";
    const corFragmento = "#include <color_fragment>";

    if (
      !shader.vertexShader.includes(inicioVertice) ||
      !shader.fragmentShader.includes(corFragmento)
    ) {
      throw new Error(
        "Os pontos de inserção do shader mudaram nesta versão do three.js.",
      );
    }

    shader.uniforms.duRampa = { value: rampa };
    shader.uniforms.duY0 = { value: gradiente.y0 };
    shader.uniforms.duSpan = { value: gradiente.y1 - gradiente.y0 };

    shader.vertexShader = `
      varying float duSvgY;
      ${shader.vertexShader}
    `.replace(
      inicioVertice,
      `${inicioVertice}
       duSvgY = position.y;`,
    );

    shader.fragmentShader = `
      varying float duSvgY;
      uniform sampler2D duRampa;
      uniform float duY0;
      uniform float duSpan;

      vec3 duParaLinear(vec3 valor) {
        vec3 baixo = valor / 12.92;
        vec3 alto = pow((valor + 0.055) / 1.055, vec3(2.4));
        return mix(baixo, alto, step(vec3(0.04045), valor));
      }

      ${shader.fragmentShader}
    `.replace(
      corFragmento,
      `${corFragmento}
       float duT = clamp((duSvgY - duY0) / duSpan, 0.0, 1.0);
       // Centros dos texels extremos da rampa de 1024 amostras.
       float duU = (duT * 1023.0 + 0.5) / 1024.0;
       vec3 duCor = texture2D(duRampa, vec2(duU, 0.5)).rgb;
       diffuseColor.rgb *= duParaLinear(duCor);`,
    );
  };

  material.customProgramCacheKey = () => "du-gradiente-vertical-r5-v1";
  return material;
}

function criarHalo(recursos: Recursos): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Não foi possível preparar o halo decorativo.");

  const gradiente = contexto.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradiente.addColorStop(0, "rgba(22,116,255,0.8)");
  gradiente.addColorStop(0.4, "rgba(22,116,255,0.35)");
  gradiente.addColorStop(1, "rgba(22,116,255,0)");
  contexto.fillStyle = gradiente;
  contexto.fillRect(0, 0, 128, 128);

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  recursos.texturas.add(textura);

  const material = new THREE.SpriteMaterial({
    map: textura,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  recursos.materiais.add(material);

  const sprite = new THREE.Sprite(material);
  sprite.position.z = -0.08;
  sprite.renderOrder = -1;
  return sprite;
}

function construirLogo(
  texto: string,
  tentativa: Tentativa,
): void {
  const doc = new DOMParser().parseFromString(texto, "image/svg+xml");
  const svg = validarDocumento(doc);
  const viewBox = lerViewBox(svg);
  tentativa.viewBox = viewBox;

  const originais = new Map<Camada, Element>();
  for (const elemento of Array.from(doc.querySelectorAll("path[id]"))) {
    const camada = nomeDaCamada(elemento.id);
    if (!camada) continue;
    if (originais.has(camada)) {
      throw new Error(`Há mais de um caminho para a camada ${camada}.`);
    }
    originais.set(camada, elemento);
  }

  for (const camada of ORDEM) {
    if (!originais.has(camada)) {
      throw new Error(`Camada ausente: ${camada}.`);
    }
  }

  /*
   * SVGLoader interpreta a geometria. Trocar os preenchimentos de uma CÓPIA
   * por cores sólidas evita delegar os gradientes à conversão do loader.
   * O documento original permanece disponível para construir os materiais.
   */
  const copia = doc.cloneNode(true) as XMLDocument;
  for (const elemento of Array.from(copia.querySelectorAll("path[id]"))) {
    if (!nomeDaCamada(elemento.id)) continue;
    elemento.setAttribute("fill", "#FFFFFF");
    const style = elemento.getAttribute("style") ?? "";
    elemento.setAttribute("style", `${style};fill:#FFFFFF;stroke:none`);
  }

  const carregado = new SVGLoader().parse(
    new XMLSerializer().serializeToString(copia),
  );

  const escala = 2 / viewBox.height;
  tentativa.grupo.scale.set(escala, -escala, escala);

  let vertices = 0;
  const presentes = new Set<Camada>();

  for (const camada of ORDEM) {
    const original = originais.get(camada)!;
    const caminho = carregado.paths.find(path => {
      const node = path.userData?.node as Element | undefined;
      return node?.id === original.id;
    });

    if (!caminho) throw new Error(`SVGLoader não retornou a camada ${camada}.`);

    const opacidade = propriedade(original, "opacity");
    const opacidadeFill = propriedade(original, "fill-opacity");
    if (
      (opacidade !== null && Number(opacidade) !== 1) ||
      (opacidadeFill !== null && Number(opacidadeFill) !== 1)
    ) {
      throw new Error("As camadas precisam ser opacas nesta referência.");
    }

    const formas = caminho.toShapes();
    if (!formas.length) throw new Error(`Camada vazia: ${camada}.`);

    const config = CONFIG[camada];
    const caixa = new THREE.Box3();
    const geometrias = formas.map(forma => {
      const geometria = new THREE.ExtrudeGeometry(forma, {
        depth: config.profundidade,
        steps: 1,
        bevelEnabled: false,
        curveSegments: 2,
      });
      tentativa.geometrias.add(geometria);
      geometria.computeBoundingBox();
      if (geometria.boundingBox) caixa.union(geometria.boundingBox);
      vertices += geometria.getAttribute("position").count;
      return geometria;
    });

    /*
     * Limite defensivo, não orçamento de performance aprovado.
     * Se a geometria real chegar perto disso, simplificar com comparação
     * visual e medir em aparelho real antes de integrar.
     */
    if (vertices > 1_000_000) {
      throw new Error("A geometria excedeu o limite desta referência.");
    }

    const fill = propriedade(original, "fill");
    if (!fill) throw new Error(`Preenchimento explícito ausente: ${camada}.`);

    const referencia = /^url\(\s*["']?#([^"')\s]+)["']?\s*\)$/.exec(fill);
    let frente: THREE.MeshStandardMaterial;

    if (referencia) {
      frente = materialGradiente(
        lerGradiente(doc, referencia[1], caixa, viewBox),
        camada,
        tentativa,
      );
    } else {
      if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(fill)) {
        throw new Error(`Preenchimento não implementado na camada ${camada}.`);
      }
      frente = materialPlano(fill, camada, tentativa);
    }

    const parede = materialPlano(config.parede, camada, tentativa);

    for (const geometria of geometrias) {
      /*
       * ExtrudeGeometry usa o índice 0 para tampas e 1 para paredes.
       * A transformação negativa em Y fica no objeto; não é incorporada
       * manualmente aos vértices, preservando o tratamento de orientação.
       */
      const mesh = new THREE.Mesh(geometria, [frente, parede]);
      mesh.position.set(
        -viewBox.x - viewBox.width / 2,
        -viewBox.y - viewBox.height / 2,
        config.z,
      );
      mesh.name = `dragon-universe-${camada}`;
      tentativa.grupo.add(mesh);
    }

    presentes.add(camada);
  }

  if (presentes.size !== ORDEM.length) {
    throw new Error("A montagem não incluiu todas as camadas.");
  }

  tentativa.cena.add(tentativa.grupo);
  tentativa.halo = criarHalo(tentativa);
  tentativa.halo.scale.set(viewBox.width * escala * 1.08, 2.6, 1);
  tentativa.cena.add(tentativa.halo);

  const ambiente = new THREE.HemisphereLight("#FFFFFF", "#263B57", 1.5);
  const principal = new THREE.DirectionalLight("#FFFFFF", 1.8);
  principal.position.set(-3, 4, 8);

  const preenchimento = new THREE.DirectionalLight("#70C9FF", 0.45);
  preenchimento.position.set(4, 0, 5);

  tentativa.cena.add(ambiente, principal, preenchimento);
}

export function montarLogo3D(opcoes: OpcoesLogo3D): ControleLogo3D {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("montarLogo3D deve ser chamado somente no cliente.");
  }

  const {
    container,
    fallback,
    svgUrl,
    pngFallbackUrl,
    reservarCanvas,
    aoFalhar,
  } = opcoes;

  if (!container.contains(fallback)) {
    throw new Error("A imagem de fallback precisa estar dentro do container.");
  }

  const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)");
  const tinhaRole = container.getAttribute("role");
  const tinhaLabel = container.getAttribute("aria-label");
  const posicaoAnterior = container.style.position;
  const altAnterior = fallback.getAttribute("alt");

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  container.setAttribute("role", "img");
  container.setAttribute(
    "aria-label",
    "Logo do Dragon Universe, em letras azuis blocadas.",
  );
  fallback.alt = "";
  fallback.hidden = false;

  let destruido = false;
  let visivel = false;
  let interagiu = opcoes.jaInteragiu ?? false;
  let falhou = false;
  let tentativa: Tentativa | null = null;
  let largura = container.clientWidth;
  let altura = container.clientHeight;
  let pngTentado = false;

  /*
   * Reserva textual só aparece se tanto SVG quanto PNG falharem.
   * Não desenha uma marca substituta.
   */
  const reservaTexto = document.createElement("span");
  reservaTexto.textContent = "Dragon Universe";
  reservaTexto.hidden = true;
  reservaTexto.setAttribute("aria-hidden", "true");
  reservaTexto.style.cssText =
    "color:#F4F7FF;font:700 1.5rem/1.2 system-ui,sans-serif;text-align:center";
  container.append(reservaTexto);

  const aoFalharImagem = (): void => {
    if (!pngTentado) {
      pngTentado = true;
      fallback.srcset = "";
      fallback.src = pngFallbackUrl;
      return;
    }
    fallback.hidden = true;
    reservaTexto.hidden = false;
  };
  fallback.addEventListener("error", aoFalharImagem);

  if (fallback.complete && fallback.naturalWidth === 0) {
    aoFalharImagem();
  }

  function mostrarFallback(): void {
    if (reservaTexto.hidden) fallback.hidden = false;
  }

  function encerrarTentativa(): void {
    const atual = tentativa;
    tentativa = null;
    mostrarFallback();
    if (!atual) return;

    atual.abort.abort();
    if (atual.raf) cancelAnimationFrame(atual.raf);

    const renderer = atual.renderer;
    if (atual.timerContexto) clearTimeout(atual.timerContexto);
    if (renderer && atual.aoPerderContexto) {
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        atual.aoPerderContexto,
      );
    }
    if (renderer && atual.aoRestaurarContexto) {
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        atual.aoRestaurarContexto,
      );
    }

    atual.geometrias.forEach(geometria => geometria.dispose());
    atual.materiais.forEach(material => material.dispose());
    atual.texturas.forEach(textura => textura.dispose());
    atual.cena.clear();

    try {
      if (renderer) {
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
    } finally {
      atual.liberarVaga();
    }
  }

  function registrarFalha(erro: unknown): void {
    falhou = true;
    encerrarTentativa();
    aoFalhar?.(erroDe(erro));
  }

  function permitido(): boolean {
    return (
      !destruido &&
      !falhou &&
      visivel &&
      interagiu &&
      !reduzirMovimento.matches &&
      document.visibilityState === "visible" &&
      largura > 0 &&
      altura > 0
    );
  }

  function ajustarCamera(atual: Tentativa): void {
    if (!atual.renderer || !atual.viewBox || largura <= 0 || altura <= 0) return;

    const aspect = largura / altura;
    const larguraMarca = (atual.viewBox.width / atual.viewBox.height) * 2;
    const alturaVisivel = Math.max(2.5, (larguraMarca * 1.12) / aspect);
    const metade = alturaVisivel / 2;

    atual.camera.left = -metade * aspect;
    atual.camera.right = metade * aspect;
    atual.camera.top = metade;
    atual.camera.bottom = -metade;
    atual.camera.near = 0.01;
    atual.camera.far = 100;
    atual.camera.position.set(0, 0, 40);
    atual.camera.lookAt(0, 0, 0);
    atual.camera.updateProjectionMatrix();

    atual.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    atual.renderer.setSize(largura, altura, false);
  }

  function renderizar(atual: Tentativa): void {
    if (tentativa !== atual || !atual.renderer || atual.contextoPerdido || !permitido()) return;

    try {
      atual.renderer.render(atual.cena, atual.camera);
      if (atual.renderer.getContext().isContextLost()) {
        throw new Error("O contexto WebGL foi perdido.");
      }
    } catch (erro) {
      registrarFalha(erro);
    }
  }

  function animarEntrada(atual: Tentativa): void {
    const inicio = performance.now();
    const deveAnimar = !animacaoConsumida;
    animacaoConsumida = true;

    const quadro = (agora: number): void => {
      atual.raf = 0;
      if (tentativa !== atual || atual.contextoPerdido || !permitido()) return;

      const t = deveAnimar
        ? THREE.MathUtils.clamp((agora - inicio) / DURACAO_ENTRADA, 0, 1)
        : 1;
      const restante = Math.pow(1 - t, 3);

      atual.grupo.rotation.y = THREE.MathUtils.degToRad(-2) * restante;
      atual.grupo.rotation.x = THREE.MathUtils.degToRad(1) * restante;

      if (atual.halo) {
        (atual.halo.material as THREE.SpriteMaterial).opacity =
          0.08 + 0.06 * restante;
      }

      renderizar(atual);
      if (tentativa !== atual) return;

      if (t < 1) atual.raf = requestAnimationFrame(quadro);
    };

    atual.raf = requestAnimationFrame(quadro);
  }

  async function iniciar(): Promise<void> {
    if (tentativa || !permitido()) return;

    const atual: Tentativa = {
      abort: new AbortController(),
      liberarVaga: () => {},
      geometrias: new Set(),
      materiais: new Set(),
      texturas: new Set(),
      cena: new THREE.Scene(),
      grupo: new THREE.Group(),
      camera: new THREE.OrthographicCamera(),
      renderer: null,
      halo: null,
      viewBox: null,
      raf: 0,
      aoPerderContexto: null,
      aoRestaurarContexto: null,
      timerContexto: 0,
      contextoPerdido: false,
    };
    tentativa = atual;

    try {
      const resposta = await fetch(svgUrl, {
        signal: atual.abort.signal,
        credentials: "same-origin",
      });
      if (!resposta.ok) {
        throw new Error(`Falha ao carregar o logo: HTTP ${resposta.status}.`);
      }
      const texto = await resposta.text();

      if (tentativa !== atual || !permitido()) return;

      construirLogo(texto, atual);

      // Só agora, com o SVG interpretado, a vaga do limite global de canvases é pedida (R2-B3b).
      const liberarVaga = reservarCanvas();
      if (!liberarVaga) {
        encerrarTentativa();
        return;
      }
      atual.liberarVaga = liberarVaga;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
      atual.renderer = renderer;

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.setClearColor("#000000", 0);
      renderer.shadowMap.enabled = false;

      /*
       * Complementa a captura de erros: falhas de shader podem ser
       * registradas pelo renderer sem lançar exceção automaticamente.
       */
      renderer.debug.checkShaderErrors = true;
      renderer.debug.onShaderError = () => {
        throw new Error("O shader do logo não compilou nesta configuração.");
      };

      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      canvas.hidden = true;

      atual.aoPerderContexto = (event: Event): void => {
        event.preventDefault();
        if (tentativa !== atual) return;
        // Volta ao fallback e espera o navegador restaurar o contexto; se não voltar, encerra.
        atual.contextoPerdido = true;
        if (atual.raf) cancelAnimationFrame(atual.raf);
        atual.raf = 0;
        canvas.hidden = true;
        mostrarFallback();
        atual.timerContexto = window.setTimeout(() => {
          if (tentativa === atual && atual.contextoPerdido) {
            registrarFalha(new Error("O navegador não restaurou o contexto WebGL do logo."));
          }
        }, ESPERA_CONTEXTO);
      };
      atual.aoRestaurarContexto = (): void => {
        if (tentativa !== atual || !atual.contextoPerdido) return;
        clearTimeout(atual.timerContexto);
        atual.timerContexto = 0;
        atual.contextoPerdido = false;
        if (!permitido()) return;
        // O three.js recria seu estado ao restaurar; o quadro final é desenhado de novo, sem repetir a entrada.
        canvas.hidden = false;
        fallback.hidden = true;
        reservaTexto.hidden = true;
        animarEntrada(atual);
      };
      canvas.addEventListener("webglcontextlost", atual.aoPerderContexto);
      canvas.addEventListener("webglcontextrestored", atual.aoRestaurarContexto);
      container.append(canvas);

      ajustarCamera(atual);
      renderer.compile(atual.cena, atual.camera);
      renderer.render(atual.cena, atual.camera);

      if (renderer.getContext().isContextLost()) {
        throw new Error("WebGL indisponível após a preparação do logo.");
      }

      if (tentativa !== atual || !permitido()) return;

      /*
       * A imagem só sai depois da primeira renderização bem-sucedida.
       * Nenhum estado vazio é usado enquanto o módulo ou SVG carrega.
       */
      canvas.hidden = false;
      fallback.hidden = true;
      reservaTexto.hidden = true;
      animarEntrada(atual);
    } catch (erro) {
      if (tentativa !== atual || atual.abort.signal.aborted || destruido) return;
      registrarFalha(erro);
    } finally {
      if (tentativa === atual && !permitido()) encerrarTentativa();
    }
  }

  function reavaliar(): void {
    if (!permitido()) {
      encerrarTentativa();
      return;
    }
    void iniciar();
  }

  const eventosInteracao = ["pointerdown", "keydown", "wheel", "scroll"] as const;

  const primeiraInteracao = (): void => {
    interagiu = true;
    eventosInteracao.forEach(nome =>
      window.removeEventListener(nome, primeiraInteracao),
    );
    reavaliar();
  };

  if (!interagiu) {
    eventosInteracao.forEach(nome =>
      window.addEventListener(nome, primeiraInteracao, { passive: true }),
    );
  }

  const mudarTamanho = (): void => {
    largura = container.clientWidth;
    altura = container.clientHeight;

    if (!permitido()) {
      encerrarTentativa();
      return;
    }

    if (tentativa?.renderer) {
      ajustarCamera(tentativa);
      if (!tentativa.raf) renderizar(tentativa);
    } else {
      reavaliar();
    }
  };

  const mudarPreferencia = (): void => reavaliar();
  const mudarVisibilidade = (): void => reavaliar();

  reduzirMovimento.addEventListener("change", mudarPreferencia);
  document.addEventListener("visibilitychange", mudarVisibilidade);
  window.addEventListener("resize", mudarTamanho, { passive: true });

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(mudarTamanho)
      : null;
  resizeObserver?.observe(container);

  /*
   * Sem IntersectionObserver, conservar o fallback. Não iniciar WebGL
   * indiscriminadamente em navegadores sem observação de visibilidade.
   */
  const intersectionObserver =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          entradas => {
            const entrada = entradas.find(item => item.target === container);
            if (!entrada) return;
            visivel = entrada.isIntersecting && entrada.intersectionRatio > 0;
            reavaliar();
          },
          { threshold: [0, 0.01] },
        )
      : null;
  intersectionObserver?.observe(container);

  return {
    tentarNovamente(): void {
      if (destruido) return;
      falhou = false;
      reavaliar();
    },

    liberar(): void {
      if (destruido) return;
      encerrarTentativa();
    },

    destruir(): void {
      if (destruido) return;
      destruido = true;

      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();

      eventosInteracao.forEach(nome =>
        window.removeEventListener(nome, primeiraInteracao),
      );
      reduzirMovimento.removeEventListener("change", mudarPreferencia);
      document.removeEventListener("visibilitychange", mudarVisibilidade);
      window.removeEventListener("resize", mudarTamanho);
      fallback.removeEventListener("error", aoFalharImagem);

      encerrarTentativa();
      reservaTexto.remove();
      fallback.hidden = false;
      container.style.position = posicaoAnterior;

      if (tinhaRole === null) container.removeAttribute("role");
      else container.setAttribute("role", tinhaRole);

      if (tinhaLabel === null) container.removeAttribute("aria-label");
      else container.setAttribute("aria-label", tinhaLabel);

      if (altAnterior === null) fallback.removeAttribute("alt");
      else fallback.setAttribute("alt", altAnterior);
    },
  };
}

/**
 * Cena do logo para o hero em React Three Fiber (v3): reaproveita a montagem aprovada (extrusão do SVG, materiais,
 * halo e luzes) sem criar renderer nem câmera. A cena devolvida entra como filha da cena do R3F. Altura do logo = 2
 * unidades; `largura` é a largura correspondente. `liberar()` descarta geometrias, materiais e texturas.
 */
export type CenaDoLogo = {
  cena: THREE.Scene;
  grupo: THREE.Group;
  halo: THREE.Sprite | null;
  largura: number;
  liberar: () => void;
};

export async function carregarCenaDoLogo(svgUrl: string, sinal?: AbortSignal): Promise<CenaDoLogo> {
  const resposta = await fetch(svgUrl, { signal: sinal });
  if (!resposta.ok) throw new Error(`Não foi possível carregar o logo (${resposta.status}).`);
  const texto = await resposta.text();
  const tentativa = {
    geometrias: new Set<THREE.BufferGeometry>(),
    materiais: new Set<THREE.Material>(),
    texturas: new Set<THREE.Texture>(),
    cena: new THREE.Scene(),
    grupo: new THREE.Group(),
    viewBox: null,
    halo: null,
  } as unknown as Tentativa;
  construirLogo(texto, tentativa);
  const vb = tentativa.viewBox as ViewBox | null;
  if (!vb) throw new Error("O logo não tem viewBox.");
  return {
    cena: tentativa.cena,
    grupo: tentativa.grupo,
    halo: tentativa.halo,
    largura: vb.width * (2 / vb.height),
    liberar: () => {
      tentativa.geometrias.forEach((g) => g.dispose());
      tentativa.materiais.forEach((m) => m.dispose());
      tentativa.texturas.forEach((t) => t.dispose());
    },
  };
}

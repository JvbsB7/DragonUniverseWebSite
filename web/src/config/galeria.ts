import { asset } from "@/lib/asset";

// Galeria de prévias (copy §5). Todas são construções que ainda não estão no add-on.
export type GaleriaItem = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Página da wiki sobre a construção. */
  wiki: string;
  /** Categoria do filtro: só existem categorias com material real. */
  categoria: "estruturas" | "planetas" | "personagens";
};

export const galeria: GaleriaItem[] = [
  {
    src: asset("/img/planeta-do-bills-859.webp"),
    width: 859,
    height: 531,
    alt: "Prévia do Planeta do Bills, construção da equipe do Dragon Universe, ainda em desenvolvimento.",
    caption: "Planeta do Bills.",
    wiki: "/wiki/planetas-e-dimensoes/planeta-do-bills",
    categoria: "planetas",
  },
  {
    src: asset("/img/torneio-do-poder-792.webp"),
    width: 792,
    height: 486,
    alt: "Prévia da arena do Torneio do Poder, em desenvolvimento.",
    caption: "Arena do Torneio do Poder.",
    wiki: "/wiki/construcoes/torneio-do-poder",
    categoria: "estruturas",
  },
  {
    src: asset("/img/corporacao-capsula-vista-de-cima-762.webp"),
    width: 762,
    height: 658,
    alt: "Prévia da Corporação Cápsula vista de cima, em desenvolvimento.",
    caption: "Corporação Cápsula, vista de cima.",
    wiki: "/wiki/construcoes/corporacao-capsula",
    categoria: "estruturas",
  },
  {
    src: asset("/img/namek-casa-do-guru-exterior-1129.webp"),
    width: 1129,
    height: 713,
    alt: "Prévia da parte externa da Casa do Guru, em Namekusei, em desenvolvimento.",
    caption: "Casa do Guru, em Namekusei, por fora.",
    wiki: "/wiki/construcoes/casa-do-guru",
    categoria: "estruturas",
  },
  {
    src: asset("/img/namek-casa-do-guru-interior-1286.webp"),
    width: 1286,
    height: 839,
    alt: "Prévia do interior da Casa do Guru, em Namekusei, em desenvolvimento.",
    caption: "Casa do Guru, em Namekusei, por dentro.",
    wiki: "/wiki/construcoes/casa-do-guru",
    categoria: "estruturas",
  },
  {
    src: asset("/img/torneio-de-artes-marciais-1499.webp"),
    width: 1499,
    height: 839,
    alt: "Prévia da arena do Torneio de Artes Marciais, em desenvolvimento.",
    caption: "Arena do Torneio de Artes Marciais.",
    wiki: "/wiki/construcoes/torneio-de-artes-marciais",
    categoria: "estruturas",
  },
  {
    src: asset("/img/nave-do-freeza-frente-1216.webp"),
    width: 1216,
    height: 607,
    alt: "Prévia da nave do Freeza vista de frente, em desenvolvimento.",
    caption: "Nave do Freeza, vista de frente.",
    wiki: "/wiki/construcoes/nave-do-freeza",
    categoria: "estruturas",
  },
  {
    src: asset("/img/nave-do-freeza-vista-de-cima-763.webp"),
    width: 763,
    height: 463,
    alt: "Prévia da nave do Freeza vista de cima, em desenvolvimento.",
    caption: "Nave do Freeza, vista de cima.",
    wiki: "/wiki/construcoes/nave-do-freeza",
    categoria: "estruturas",
  },
  {
    src: asset("/img/estrutura-palacio-branco-penhasco-1365.webp"),
    width: 1365,
    height: 850,
    alt: "Prévia do Castelo do Rei Vegeta, um palácio branco sobre um penhasco, em desenvolvimento.",
    caption: "Castelo do Rei Vegeta.",
    wiki: "/wiki/construcoes/castelo-do-rei-vegeta",
    categoria: "estruturas",
  },
  {
    src: asset("/img/estrutura-torre-cupulas-roxas-580.webp"),
    width: 580,
    height: 932,
    alt: "Prévia da Prisão Galáctica, uma torre com cúpulas roxas, em desenvolvimento.",
    caption: "Prisão Galáctica.",
    wiki: "/wiki/construcoes/prisao-galactica",
    categoria: "estruturas",
  },
  {
    src: asset("/img/planeta-rosa-npc-rosa-573.webp"),
    width: 573,
    height: 579,
    alt: "NPC novo de tom rosa em um planeta rosa, em desenvolvimento.",
    caption: "NPCs novos no planeta rosa. Nomes definitivos depois.",
    wiki: "/wiki/planetas-e-dimensoes/planeta-rosa",
    categoria: "planetas",
  },
  {
    src: asset("/img/planeta-rosa-npc-verde-711.webp"),
    width: 711,
    height: 719,
    alt: "NPC novo de tom verde em um planeta rosa, em desenvolvimento.",
    caption: "NPCs novos no planeta rosa. Nomes definitivos depois.",
    wiki: "/wiki/planetas-e-dimensoes/planeta-rosa",
    categoria: "planetas",
  },
  {
    src: asset("/img/personagem-armadura-azul-410.webp"),
    width: 410,
    height: 453,
    alt: "NPC novo com armadura azul-clara e olhos vermelhos, em desenvolvimento.",
    caption: "NPC novo de armadura azul-clara e olhos vermelhos. Nome definitivo depois.",
    wiki: "/wiki/construcoes/personagem-armadura-azul",
    categoria: "personagens",
  },
];

export const categoriasGaleria = [
  { id: "todas", rotulo: "Todas" },
  { id: "estruturas", rotulo: "Estruturas" },
  { id: "planetas", rotulo: "Planetas" },
  { id: "personagens", rotulo: "Personagens" },
] as const;

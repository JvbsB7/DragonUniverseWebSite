// Tipos e constantes da wiki que também podem ir para o cliente (sem fs).
export const wikiStatuses = ["no-jogo", "em-desenvolvimento", "planejado"] as const;
export type WikiStatus = (typeof wikiStatuses)[number];

export const statusLabel: Record<WikiStatus, string> = {
  "no-jogo": "Já no jogo",
  "em-desenvolvimento": "Em desenvolvimento",
  planejado: "Planejado",
};

// Slugs das 13 categorias (PROMPT_SITE.md §4.1). O título aqui só vale se a categoria
// ainda não tiver `_categoria.mdx`; o título do arquivo sempre vence.
export const knownCategories = [
  { slug: "racas", title: "Raças" },
  { slug: "transformacoes", title: "Transformações" },
  { slug: "ataques-de-ki", title: "Ataques de ki" },
  { slug: "tecnicas", title: "Técnicas" },
  { slug: "fusoes", title: "Fusões" },
  { slug: "voo", title: "Voo" },
  { slug: "progressao-e-combate", title: "Progressão e combate" },
  { slug: "treinamento-e-mestres", title: "Treinamento e mestres" },
  { slug: "historia-e-sagas", title: "História e sagas" },
  { slug: "planetas-e-dimensoes", title: "Planetas e dimensões" },
  { slug: "esferas-do-dragao", title: "Esferas do Dragão" },
  { slug: "multiplayer", title: "Multiplayer" },
  { slug: "construcoes", title: "Construções" },
] as const;

export type WikiHeading = { id: string; text: string; level: 2 | 3 };

export type WikiCategory = {
  slug: string;
  title: string;
  description: string;
  order: number;
  body: string;
  hasIntro: boolean;
};

export type WikiPage = {
  slug: string;
  category: string;
  title: string;
  description: string;
  status: WikiStatus;
  image: string | null;
  order: number;
  body: string;
  headings: WikiHeading[];
};

// Item do índice de busca gerado no build.
export type WikiIndexItem = {
  category: string;
  categoryTitle: string;
  slug: string;
  title: string;
  description: string;
  status: WikiStatus;
  search: string;
};

/** Texto sem acento e em minúsculas, para a busca. */
export const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

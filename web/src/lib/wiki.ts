import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import {
  knownCategories,
  wikiStatuses,
  type WikiCategory,
  type WikiHeading,
  type WikiIndexItem,
  type WikiPage,
  type WikiStatus,
} from "./wiki-types";

// Conteúdo lido no build: web/content/wiki/<categoria>/{_categoria,<pagina>}.mdx.
const root = path.join(process.cwd(), "content", "wiki");

function fail(file: string, msg: string): never {
  throw new Error(`[wiki] ${path.relative(process.cwd(), file)}: ${msg}`);
}

function text(file: string, data: Record<string, unknown>, key: string): string {
  const v = data[key];
  if (typeof v !== "string" || v.trim() === "") fail(file, `front-matter "${key}" é obrigatório (texto não vazio).`);
  return v.trim();
}

function order(file: string, data: Record<string, unknown>): number {
  const v = data.order;
  if (typeof v !== "number" || !Number.isFinite(v)) fail(file, 'front-matter "order" é obrigatório (número).');
  return v;
}

function listDir(dir: string): fs.Dirent[] {
  return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
}

// Texto simples de um título Markdown, igual ao que o rehype-slug usa para gerar o id.
function plainHeading(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

export function extractHeadings(body: string): WikiHeading[] {
  const slugger = new GithubSlugger();
  const out: WikiHeading[] = [];
  let fence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    const m = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const t = plainHeading(m[2]);
    out.push({ id: slugger.slug(t), text: t, level: m[1].length as 2 | 3 });
  }
  return out;
}

function readCategory(slug: string, dir: string): WikiCategory {
  const known = knownCategories.find((c) => c.slug === slug);
  const file = path.join(dir, "_categoria.mdx");
  if (!fs.existsSync(file)) {
    return { slug, title: known?.title ?? slug, description: "", order: 1000, body: "", hasIntro: false };
  }
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    title: text(file, data, "title"),
    description: text(file, data, "description"),
    order: order(file, data),
    body: content.trim(),
    hasIntro: true,
  };
}

function readPage(category: string, file: string): WikiPage {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const slug = path.basename(file, ".mdx");
  if (data.category !== category) {
    fail(file, `front-matter "category" deve ser "${category}" (nome da pasta); veio ${JSON.stringify(data.category)}.`);
  }
  const status = data.status;
  if (!wikiStatuses.includes(status as WikiStatus)) {
    fail(file, `front-matter "status" inválido (${JSON.stringify(status)}). Use: ${wikiStatuses.join(", ")}.`);
  }
  const image = data.image;
  if (image !== null && (typeof image !== "string" || image.trim() === "")) {
    fail(file, 'front-matter "image" é obrigatório: caminho da imagem ou null.');
  }
  const body = content.trim();
  return {
    slug,
    category,
    title: text(file, data, "title"),
    description: text(file, data, "description"),
    status: status as WikiStatus,
    image: image as string | null,
    order: order(file, data),
    body,
    headings: extractHeadings(body),
  };
}

const byOrder = <T extends { order: number; title: string }>(a: T, b: T) =>
  a.order - b.order || a.title.localeCompare(b.title, "pt-BR");

export const loadWiki = cache(() => {
  const dirs = listDir(root).filter((d) => d.isDirectory());
  const slugs = new Set<string>([...knownCategories.map((c) => c.slug), ...dirs.map((d) => d.name)]);
  const categories: WikiCategory[] = [];
  const pages: WikiPage[] = [];
  for (const slug of slugs) {
    const dir = path.join(root, slug);
    categories.push(readCategory(slug, dir));
    for (const f of listDir(dir)) {
      if (f.isFile() && f.name.endsWith(".mdx") && f.name !== "_categoria.mdx") {
        pages.push(readPage(slug, path.join(dir, f.name)));
      }
    }
  }
  const known = knownCategories.map((c) => c.slug) as string[];
  categories.sort((a, b) => {
    const ia = known.indexOf(a.slug);
    const ib = known.indexOf(b.slug);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  pages.sort(byOrder);
  return { categories, pages };
});

export function getCategory(slug: string) {
  return loadWiki().categories.find((c) => c.slug === slug);
}

export function getCategoryPages(slug: string) {
  return loadWiki().pages.filter((p) => p.category === slug);
}

export function getPage(category: string, slug: string) {
  return loadWiki().pages.find((p) => p.category === category && p.slug === slug);
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Texto aproximado do corpo (sem marcação) para a busca.
function plainBody(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Índice de busca gerado no build: título, descrição, títulos de seção e os primeiros 3.000 caracteres do texto (cobre as listas de formas por raça).
export function buildSearchIndex(): WikiIndexItem[] {
  const { categories, pages } = loadWiki();
  return pages.map((p) => {
    const cat = categories.find((c) => c.slug === p.category);
    return {
      category: p.category,
      categoryTitle: cat?.title ?? p.category,
      slug: p.slug,
      title: p.title,
      description: p.description,
      status: p.status,
      search: fold([p.title, p.description, ...p.headings.map((h) => h.text), plainBody(p.body).slice(0, 3000)].join(" ")),
    };
  });
}

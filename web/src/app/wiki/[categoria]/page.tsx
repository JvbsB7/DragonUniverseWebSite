import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/wiki/breadcrumbs";
import { CategoryExplorer } from "@/components/wiki/category-explorer";
import { WikiMdx } from "@/components/wiki/mdx";
import { CompactPresenter } from "@/components/compact-presenter";
import { RicardoWave } from "@/components/ricardo-wave";
import { LinkButton } from "@/components/button";
import { pageMetadata } from "@/lib/seo";
import { links } from "@/config/links";
import { getCategory, getCategoryPages, loadWiki } from "@/lib/wiki";
import { RacasVitrine } from "@/components/racas-vitrine";
import { TransformacoesShowcase } from "@/components/showcase/transformacoes-showcase";
import { UniversoShowcase } from "@/components/showcase/universo-showcase";
import { getTransformacoes } from "@/lib/transformacoes-data";
import { destinos } from "@/config/universo";

// Categorias que ganham vitrine v3 (Raças, Transformações, Explore o Universo): título, descrição e metadados da copy v3 §12.
const vitrines: Record<string, { h1: string; intro?: string; title: string; description: string }> = {
  racas: { h1: "Raças", title: "Raças | Dragon Universe", description: "As raças do Dragon Universe: as que já estão no jogo, as em desenvolvimento e as planejadas." },
  transformacoes: { h1: "Transformações", title: "Transformações | Dragon Universe", description: "Do Super Saiyajin ao Ultra Ego: as formas que já estão no jogo e as que estão planejadas." },
  "planetas-e-dimensoes": {
    h1: "Explore o Universo",
    intro: "Planetas e dimensões do add-on. Escolha um destino para ver o que existe hoje e o que ainda está nos planos.",
    title: "Explore o Universo | Dragon Universe",
    description: "Planetas e dimensões do add-on: Terra, Namekusei, Planeta Vegeta e mais. Veja o status de cada destino.",
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return loadWiki().categories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/wiki/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) return {};
  const v = vitrines[cat.slug];
  return pageMetadata({
    title: v?.title ?? `${cat.title} | Wiki Dragon Universe`,
    description: v?.description ?? (cat.description || `Páginas de ${cat.title} na wiki do Dragon Universe.`),
    path: `/wiki/${cat.slug}`,
  });
}

export default async function CategoriaPage({ params }: PageProps<"/wiki/[categoria]">) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) notFound();
  const pages = getCategoryPages(cat.slug);
  const v = vitrines[cat.slug];

  return (
    <div className="du-container flex flex-col gap-6 py-10 md:gap-8 md:py-14">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Wiki", href: "/wiki" }, { label: cat.title }]} />
      {/* Topo compacto: título, descrição literal da categoria, busca e lista (§8.2). */}
      <header className="flex flex-col gap-3">
        <h1>{v?.h1 ?? cat.title}</h1>
        {(v?.intro ?? cat.description) && <p className="max-w-[65ch] text-lg text-muted-foreground">{v?.intro ?? cat.description}</p>}
        <CompactPresenter
          name="Ricardo Vinicius"
          handle="@rvmm"
          figureClassName="h-28 w-16 md:h-[10.5rem] md:w-24"
          className="my-4 max-w-[47.5rem] md:my-6"
          figure={<RicardoWave />}
        >
          Conheça nossa wiki! Aqui você tira suas dúvidas, menos as que são surpresa.
        </CompactPresenter>
        {cat.body && <div><WikiMdx source={cat.body} /></div>}
      </header>

      {cat.slug === "racas" && <RacasVitrine />}
      {cat.slug === "transformacoes" && <TransformacoesShowcase itens={getTransformacoes()} />}
      {cat.slug === "planetas-e-dimensoes" && <UniversoShowcase destinos={destinos} />}

      <section aria-labelledby="paginas" className="flex flex-col gap-4">
        <h2 id="paginas">{v ? `Todas as páginas de ${cat.title.toLowerCase()}` : "Páginas"}</h2>
        {pages.length > 0 ? (
          <CategoryExplorer
            category={cat.slug}
            title={cat.title}
            pages={pages.map((p) => ({ slug: p.slug, title: p.title, description: p.description, status: p.status }))}
          />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-surface p-6">
            <p className="font-display text-lg font-semibold">As páginas desta categoria estão em breve.</p>
            <p className="text-muted-foreground">Quer saber quando chegarem? Acompanhe no Discord.</p>
            <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
          </div>
        )}
      </section>

      {/* Fim da página: convite ao Discord, retorno à wiki e, havendo itens planejados, o roadmap (§8.2).
          O apresentador da categoria fica de fora: a fala aprovada é a de /wiki e fala nova depende do João (revisão de copy A5). */}
      <nav aria-label="Continue explorando" className="flex flex-wrap gap-4 border-t border-edge pt-8">
        <LinkButton href="/wiki">Voltar à wiki</LinkButton>
        {pages.some((p) => p.status !== "no-jogo") && <LinkButton href="/roadmap">Ver em desenvolvimento e planejado</LinkButton>}
        <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
      </nav>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/wiki/breadcrumbs";
import { WikiMdx } from "@/components/wiki/mdx";
import { Toc } from "@/components/wiki/toc";
import { WikiStatusBadge } from "@/components/wiki/wiki-status";
import { LinkButton } from "@/components/button";
import { pageMetadata } from "@/lib/seo";
import { asset } from "@/lib/asset";
import { links } from "@/config/links";
import { getCategory, getCategoryPages, getPage, loadWiki } from "@/lib/wiki";

export const dynamicParams = false;

export function generateStaticParams() {
  const params = loadWiki().pages.map((p) => ({ categoria: p.category, pagina: p.slug }));
  // O export estático exige ao menos uma rota. Sem conteúdo, gera uma rota que cai no 404.
  return params.length > 0 ? params : [{ categoria: "racas", pagina: "_vazio" }];
}

export async function generateMetadata({ params }: PageProps<"/wiki/[categoria]/[pagina]">): Promise<Metadata> {
  const { categoria, pagina } = await params;
  const page = getPage(categoria, pagina);
  if (!page) return {};
  return pageMetadata({
    title: `${page.title} | Wiki Dragon Universe`,
    description: page.description,
    path: `/wiki/${page.category}/${page.slug}`,
    image: page.image ?? undefined,
  });
}

const vizinho =
  "flex min-h-12 min-w-0 flex-col justify-center border-2 border-border bg-surface px-4 py-3 text-text hover:bg-raised";

export default async function WikiArticlePage({ params }: PageProps<"/wiki/[categoria]/[pagina]">) {
  const { categoria, pagina } = await params;
  const page = getPage(categoria, pagina);
  const cat = getCategory(categoria);
  if (!page || !cat) notFound();
  const showGithub = page.status !== "no-jogo";

  // Anterior e próxima, na ordem editorial da categoria (copy §4).
  const irmaos = getCategoryPages(cat.slug);
  const i = irmaos.findIndex((p) => p.slug === page.slug);
  const anterior = i > 0 ? irmaos[i - 1] : null;
  const proxima = i >= 0 && i < irmaos.length - 1 ? irmaos[i + 1] : null;

  return (
    <div className="du-container flex flex-col gap-8 py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Wiki", href: "/wiki" },
          { label: cat.title, href: `/wiki/${cat.slug}` },
          { label: page.title },
        ]}
      />
      {/* Celular: sumário recolhível acima do artigo. Desktop: artigo de até 760 px e sumário de 240 px, com 48 px entre eles. */}
      <div className="grid min-w-0 gap-8 nav:grid-cols-[minmax(0,47.5rem)_15rem] nav:justify-center nav:gap-12">
        <Toc headings={page.headings} />
        <article className="min-w-0 nav:col-start-1 nav:row-start-1">
          <header className="flex flex-col gap-3">
            <div><WikiStatusBadge status={page.status} /></div>
            <h1 className="[overflow-wrap:anywhere]">{page.title}</h1>
            <p className="max-w-[65ch] text-lg text-muted-foreground">{page.description}</p>
            {page.status !== "no-jogo" && (
              <p role="note" className="max-w-[65ch] border-2 border-border bg-alert-bg p-3 text-sm text-alert-fg">
                {page.status === "em-desenvolvimento"
                  ? "Prévia. Ainda não está no add-on e não tem data."
                  : "Planejado. Sem data e sem promessa de entrega."}
              </p>
            )}
          </header>

          {/* Imagem real quando existe. Sem print, um placeholder de texto, sem altura mínima que force largura (QA R2-M1). */}
          {page.image ? (
            <img src={asset(page.image)} alt="" className="mt-6 h-auto w-full max-w-2xl border-2 border-border" />
          ) : (
            <div className="mt-6 aspect-video w-full min-w-0 max-w-2xl border-2 border-border bg-bg">
              <div aria-hidden="true" className="h-3 border-b-2 border-bg" style={{ background: "var(--du-item-energy)" }} />
              <div className="flex h-[calc(100%-0.75rem)] items-center justify-center p-4 text-center font-display font-semibold text-muted-foreground">
                <span role="img" aria-label="Espaço reservado: imagem em breve.">Imagem em breve</span>
              </div>
            </div>
          )}

          {/* Conteúdo integral do MDX, na ordem do arquivo. */}
          <div className="mt-4"><WikiMdx source={page.body} /></div>

          <aside aria-labelledby="cta-wiki" className="mt-12 flex flex-col gap-3 border-2 border-border border-s-[6px] border-s-brand bg-surface p-6">
            <h2 id="cta-wiki">Faltou alguma informação?</h2>
            <p className="max-w-[65ch] text-muted-foreground">Conte para a gente no Discord.</p>
            <div className="flex flex-wrap gap-4">
              <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
              {showGithub && <LinkButton href={links.github} external>Seguir no GitHub</LinkButton>}
            </div>
          </aside>

          {(anterior || proxima) && (
            <nav aria-label={`Páginas da categoria ${cat.title}`} className="mt-8 grid gap-4 md:grid-cols-2">
              {anterior ? (
                <Link href={`/wiki/${cat.slug}/${anterior.slug}`} className={vizinho}>
                  <span className="text-sm text-muted-foreground">Anterior:</span>
                  <strong className="font-display [overflow-wrap:anywhere]">{anterior.title}</strong>
                </Link>
              ) : (
                <span aria-hidden="true" className="hidden md:block" />
              )}
              {proxima && (
                <Link href={`/wiki/${cat.slug}/${proxima.slug}`} className={`${vizinho} md:items-end md:text-end`}>
                  <span className="text-sm text-muted-foreground">Próxima:</span>
                  <strong className="font-display [overflow-wrap:anywhere]">{proxima.title}</strong>
                </Link>
              )}
            </nav>
          )}

          <nav aria-label="Retorno da página da wiki" className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
            <Link href={`/wiki/${cat.slug}`} className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">Voltar à categoria</Link>
            <Link href="/wiki" className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">Buscar na wiki</Link>
          </nav>
        </article>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Presenter } from "@/components/presenter";
import { WikiExplorer } from "@/components/wiki/wiki-explorer";
import { loadWiki } from "@/lib/wiki";

export const metadata: Metadata = pageMetadata({
  title: "Wiki | Dragon Universe",
  description: "A wiki do Dragon Universe: raças, transformações, ataques de ki, técnicas, planetas, história e mais. Busque e filtre por status.",
  path: "/wiki",
});

export default function WikiPage() {
  const { categories, pages } = loadWiki();
  const cards = categories.map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    count: pages.filter((p) => p.category === c.slug).length,
  }));

  return (
    <div className="du-container flex max-w-6xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <h1>Wiki do Dragon Universe</h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          Tudo sobre o add-on: raças, transformações, ataques, planetas, história e mais.
        </p>
      </header>
      <Presenter className="order-2 nav:order-none" src="/skins/jvbs.png" name="João Vitor" handle="@jvbs" alt="João Vitor, o @jvbs, com cabelo preto, olhos azuis e casaco preto, apresentando a wiki.">
        Procurando alguma coisa? Use a busca ou escolha uma categoria. Eu marquei tudo com o status certo, para você saber o que já está no jogo.
      </Presenter>
      <div className="order-1 nav:order-none"><WikiExplorer categories={cards} /></div>
    </div>
  );
}

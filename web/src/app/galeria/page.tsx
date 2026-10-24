import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Gallery } from "@/components/gallery";
import { LinkButton } from "@/components/button";
import { galeria } from "@/config/galeria";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Galeria | Dragon Universe",
  description: "Imagens das construções da equipe do Dragon Universe. Todas são prévias que ainda não estão no add-on.",
  path: "/galeria",
});

export default function GaleriaPage() {
  return (
    <div className="du-container flex max-w-6xl flex-col gap-8 py-14 md:py-16">
      <header className="flex flex-col gap-3">
        <h1>Galeria</h1>
        <p className="max-w-prose text-lg text-muted-foreground">Imagens das construções da equipe. Cada legenda diz o que ainda está em desenvolvimento.</p>
        <p className="max-w-prose rounded-md bg-alert-bg p-3 text-sm text-text">
          Todas estas imagens são <strong>prévias de construções novas</strong> que <strong>ainda não estão no add-on</strong>.
        </p>
        <p className="text-sm text-muted-foreground">Clique em uma imagem para ampliar. Use Esc para fechar.</p>
      </header>

      <Gallery items={galeria} />

      <div>
        <LinkButton href={links.discord} variant="primary" external>Ver mais na comunidade</LinkButton>
      </div>
    </div>
  );
}

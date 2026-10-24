import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LinkButton } from "@/components/button";
import { SkinFace } from "@/components/skin-viewer/skin-face";
import { asset, assetSet } from "@/lib/asset";
import { CompactPresenter } from "@/components/compact-presenter";
import { TeamScene } from "@/components/team-scene/team-scene";
import { equipe } from "@/config/equipe";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Equipe e créditos | Dragon Universe",
  description: "Quem faz o Dragon Universe: João Vitor, Ricardo Vinicius e Luan Dias. Inspirado no Dragon Evolution, de About04.",
  path: "/equipe",
});

// Energia decorativa de cada integrante (cabeçalho do card). Não indica cargo nem status.
const energias = ["var(--du-energy-brand)", "var(--du-energy-god)", "var(--du-energy-golden)"];

export default function EquipePage() {
  return (
    <div className="du-container flex flex-col gap-12 py-14 md:py-16">
      {/* João só em 2D: imagem estática real, zero canvas (apresentadores-v2-5.md). */}
      <CompactPresenter
        name="João Vitor"
        handle="@jvbs"
        figureClassName="h-32 w-[4.5rem] md:h-[12.25rem] md:w-28"
        className="max-w-[45rem] -mb-6"
        figure={<img src={asset("/img/apresentadores/jvbs-224.webp")} srcSet={assetSet("/img/apresentadores/jvbs-64.webp 64w, /img/apresentadores/jvbs-96.webp 96w, /img/apresentadores/jvbs-128.webp 128w, /img/apresentadores/jvbs-192.webp 192w, /img/apresentadores/jvbs-224.webp 224w")} sizes="(min-width: 48rem) 112px, 72px" width={224} height={392} alt="" className="h-full w-full object-contain object-bottom" />}
      >
        E aí! Eu sou o João. Esta é a nossa equipe.
      </CompactPresenter>

      <header className="flex flex-col gap-3">
        <h1>Quem faz o Dragon Universe</h1>
        <p className="text-lg text-muted-foreground">Um projeto de fãs, feito por pessoas de verdade.</p>
      </header>

      <TeamScene />

      <ul className="grid gap-6 md:grid-cols-3">
        {equipe.map((p, i) => (
          <li key={p.discord} className="min-w-0 border-2 border-border bg-surface shadow-block-card">
            <div aria-hidden="true" className="h-12" style={{ background: energias[i] }} />
            <div className="flex items-start gap-4 p-5 md:p-6">
              <SkinFace src={p.skin} alt={p.alt} className="size-16" />
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="text-2xl [overflow-wrap:anywhere]">{p.nome}</h2>
                <p className="font-display text-brand">Discord {p.discord}</p>
                <p className="text-muted-foreground">{p.texto}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="credito" className="flex flex-col gap-4 border-2 border-border border-s-[6px] border-s-brand bg-surface p-6">
        <h2 id="credito">Crédito ao autor original</h2>
        <p className="font-display text-xl font-semibold text-brand">Inspirado no Dragon Evolution, de About04.</p>
        <p className="text-muted-foreground">
          O Dragon Universe é um projeto de fãs com nome e identidade próprios, inspirado no trabalho de About04.
        </p>
        <div className="flex flex-wrap gap-4">
          <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
          <LinkButton href={links.github} external>Ver no GitHub</LinkButton>
        </div>
      </section>
    </div>
  );
}

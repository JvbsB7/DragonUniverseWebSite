import Link from "next/link";
import { prefetchFor } from "@/lib/prefetch";
import { links } from "@/config/links";
import { ReduzirAnimacoes } from "@/components/reduzir-animacoes";

const linkClass = "inline-flex min-h-12 max-w-full items-center text-brand underline underline-offset-4 hover:decoration-[0.14em]";

// Colunas de links (copy v3 A.2). Todos os destinos da v2 continuam alcançáveis.
const colunas = [
  {
    titulo: "O site",
    links: [
      { label: "Início", href: "/" },
      { label: "O Projeto", href: "/sobre" },
      { label: "Raças", href: "/wiki/racas" },
      { label: "Transformações", href: "/wiki/transformacoes" },
      { label: "Universo", href: "/wiki/planetas-e-dimensoes" },
      { label: "Desenvolvimento", href: "/roadmap" },
      { label: "Wiki", href: "/wiki" },
      { label: "Novidades", href: "/novidades" },
      { label: "Galeria", href: "/galeria" },
    ],
  },
  {
    titulo: "Para jogar",
    links: [
      { label: "Como instalar", href: "/instalar" },
      { label: "FAQ", href: "/faq" },
      { label: "Apoie o Projeto", href: "/apoie" },
    ],
  },
  {
    titulo: "Comunidade",
    links: [
      { label: "Discord", href: links.discord, external: true },
      { label: "GitHub", href: links.github, external: true },
      { label: "Equipe", href: "/equipe" },
    ],
  },
];

// Avisos legais exatos (copy §13). Não alterar sem revisão do time. Texto de 14 px ou mais, alvos de 48 px (§7.5).
export function SiteFooter() {
  return (
    <footer className="border-t border-edge bg-surface py-12 text-sm leading-[1.57] text-muted-foreground nav:py-14">
      <div className="du-container">
        <div className="grid gap-4">
          <p>
            Dragon Ball é propriedade de Akira Toriyama, Shueisha e Toei Animation. Minecraft é marca da Mojang/Microsoft.
            Projeto de fãs, sem vínculo oficial.
          </p>
          <p className="font-semibold text-text">Inspirado no Dragon Evolution, de About04.</p>
          <p lang="en">NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</p>
          <p>Requer Minecraft Bedrock 26.52 com Beta APIs ativado · Versão de teste · Faça backup do seu mundo</p>
        </div>
        <nav id="menu-completo" tabIndex={-1} aria-label="Links do rodapé" className="mt-8 grid gap-6 md:grid-cols-3">
          {colunas.map((c) => (
            <div key={c.titulo} className="min-w-0">
              <h2 className="font-display text-lg text-text">{c.titulo}</h2>
              <ul className="mt-2 grid">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {l.label}
                        <span className="sr-only"> (abre em uma nova aba)</span>
                      </a>
                    ) : (
                      <Link href={l.href} prefetch={prefetchFor(l.href)} className={linkClass}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-8 border-t border-edge pt-4">
          <ReduzirAnimacoes id="reduzir-rodape" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-edge pt-4">
          <p>Projeto de fãs Dragon Universe.</p>
          <a href="#topo" className={linkClass}>
            Voltar ao topo
          </a>
        </div>
      </div>
    </footer>
  );
}

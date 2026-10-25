import Link from "next/link";
import { asset } from "@/lib/asset";
import { links } from "@/config/links";
import { HeaderNav } from "@/components/header-nav";
import { HeaderShell } from "@/components/header-shell";
import { MenuTrigger } from "@/components/menu-trigger";
import { buttonClass } from "@/components/button";

// Cabeçalho v3 (v3-04-design.md §6 e design r1 §1). Desktop (≥ 1100 px): cartão flutuante de vidro com duas linhas
// (logo + Discord; sete destinos + Mais). Abaixo disso: barra opaca com a assinatura compacta (D + nome), Discord e
// "Abrir menu"; abaixo de 432 px o Discord sai do cabeçalho e fica no topo do menu (a marca e o botão do menu não estouram a
// largura com texto ampliado). A casca (HeaderShell) mede a ocupação e publica --du-header-offset para o foco.
export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="du-container">
        <div className="glass-panel rounded-xl border border-edge bg-surface px-4 py-2 shadow-block-card nav:bg-glass nav:px-6 nav:py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 max-[22.499rem]:items-start">
            <Link
              href="/"
              prefetch={false}
              aria-label="Dragon Universe, ir para o início"
              className="inline-flex min-h-12 min-w-0 items-center text-text"
            >
              <span className="inline-flex items-center gap-2">
                {/* Um único logo por largura (<picture>), com proporção reservada: D original 184×187 abaixo de 768 px
                    e wordmark 1934×187 a partir dele. O logo não é recolorido nem redesenhado. */}
                <picture className="shrink-0">
                  <source media="(min-width: 48rem)" srcSet={asset("/img/logo/logo-dragon-universe.svg")} width={1934} height={187} />
                  <img
                    src={asset("/img/logo/logo-monograma-d.svg")}
                    alt=""
                    width={184}
                    height={187}
                    className="block aspect-[184/187] h-auto w-11 md:aspect-[1934/187] md:w-80"
                  />
                </picture>
                <span aria-hidden="true" className="font-display text-lg leading-[1.1112] font-bold md:hidden">
                  <span className="block">Dragon</span>{" "}
                  <span className="block">Universe</span>
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2 max-[22.499rem]:ml-auto md:gap-3">
              <a
                href={links.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord, abre em nova aba"
                className={buttonClass("primary") + " min-w-21 max-[27rem]:hidden"}
              >
                Discord
              </a>
              <MenuTrigger />
            </div>
          </div>
          <HeaderNav />
        </div>
      </div>
    </HeaderShell>
  );
}

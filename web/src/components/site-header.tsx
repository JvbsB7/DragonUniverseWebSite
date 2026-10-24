import Link from "next/link";
import { asset } from "@/lib/asset";
import { links } from "@/config/links";
import { HeaderNav } from "@/components/header-nav";
import { MenuTrigger } from "@/components/menu-trigger";

// Cabeçalho (v2-04-design.md §6 e §7.2). No fluxo, fundo opaco. Abaixo de 768 px: assinatura compacta (D + nome em texto).
// A partir de 768 px: wordmark de 320 px. A partir de 1100 px: sete links em segunda linha.
export function SiteHeader() {
  return (
    <header className="relative z-30 border-b-2 border-border bg-bg">
      <div className="du-container">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 nav:py-4 max-[22.499rem]:items-start">
          <Link
            href="/"
            prefetch={false}
            aria-label="Dragon Universe, ir para o início"
            className="inline-flex min-h-12 min-w-0 items-center text-brand"
          >
            <span className="inline-flex items-center gap-2">
              {/* Um único logo por largura, baixado só quando visível (<picture>) e com proporção reservada para não deslocar o layout:
                  D original 184×187 abaixo de 768 px e wordmark 1934×187 a partir dele. */}
              <picture className="shrink-0">
                <source media="(min-width: 48rem)" srcSet={asset("/img/logo/logo-dragon-universe.svg")} width={1934} height={187} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
              className="inline-flex min-h-12 min-w-21 items-center justify-center border-2 border-bg bg-action px-3 font-display text-base font-semibold text-bg hover:bg-action-hover active:bg-action-pressed md:px-4"
            >
              <span className="nav:hidden">
                Discord<span className="sr-only">: entrar na comunidade</span>
              </span>
              <span className="hidden nav:inline">Entrar no Discord</span>
              <span className="sr-only"> (abre em uma nova aba)</span>
            </a>
            <MenuTrigger />
          </div>

          <HeaderNav />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { prefetchFor } from "@/lib/prefetch";
import { cn } from "@/lib/utils";

const itemClass =
  "relative inline-flex min-h-12 items-center rounded-md px-1 text-base font-semibold hover:text-brand after:absolute after:inset-x-1 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-160 hover:after:scale-x-100";

// Navegação principal do desktop (≥ 1100 px). `aria-current="page"` só na página exata; o filete ciano curto marca a
// página ou a seção atual e transita em 160 ms (v3-04-design.md §6.2). O "Mais" abre por clique ou teclado.
export function HeaderNav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLLIElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const maisAtivo = siteConfig.mais.some((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  // Itens da wiki mais específicos (Raças, Transformações, Universo) vencem o "Wiki" do grupo Mais.
  const especifico = siteConfig.nav.some((i) => i.href !== "/" && i.href.startsWith("/wiki/") && (pathname === i.href || pathname.startsWith(`${i.href}/`)));

  return (
    <nav aria-label="Navegação principal" className="hidden nav:block">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-0">
        {siteConfig.nav.map((item) => {
          const exact = pathname === item.href;
          const section = !exact && item.href !== "/" && pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={prefetchFor(item.href)}
                aria-current={exact ? "page" : undefined}
                className={cn(itemClass, exact || section ? "text-brand after:scale-x-100" : "text-text")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li ref={caixa} className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setAberto(false)}>
          <button
            ref={botao}
            type="button"
            aria-expanded={aberto}
            aria-controls="mais-paginas"
            aria-label="Mais páginas do site"
            onClick={() => setAberto((v) => !v)}
            className={cn(itemClass, "gap-1", maisAtivo && !especifico ? "text-brand after:scale-x-100" : "text-text")}
          >
            Mais
            <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-160", aberto && "rotate-180")} />
          </button>
          {aberto && (
            <ul
              id="mais-paginas"
              className="absolute end-0 top-full z-40 mt-2 grid min-w-52 gap-0.5 rounded-xl border border-border bg-surface p-2 shadow-block-card"
            >
              {siteConfig.mais.map((item) => {
                const exact = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={prefetchFor(item.href)}
                      aria-current={exact ? "page" : undefined}
                      onClick={() => setAberto(false)}
                      className={cn(
                        "flex min-h-12 items-center rounded-md px-3 text-base font-semibold hover:bg-raised hover:text-brand",
                        exact ? "text-brand underline underline-offset-4" : "text-text",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

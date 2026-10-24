"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BookOpen, Home, Menu, Newspaper, Package, type LucideIcon } from "lucide-react";
import { useLightbox } from "@/store/lightbox";
import { useMenu } from "@/store/menu";
import { prefetchFor } from "@/lib/prefetch";
import { cn } from "@/lib/utils";

// Hotbar mobile (v2-04-design.md §7.3). Cinco posições, rótulos inteiros. Fixa só quando cabe com folga; senão fica no fim da página.
const itens: { href: string; label: string; icon: LucideIcon; ariaLabel?: string }[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
  { href: "/novidades", label: "Novidades", icon: Newspaper },
  { href: "/instalar", label: "Instalar", icon: Package, ariaLabel: "Como instalar" },
];

const FIXA_ATE = 0.25; // acima de 25% da altura útil, volta ao fluxo
const FIXA_DE = 0.22; // só fixa de novo abaixo de 22% (histerese)

function alturaUtil() {
  const vv = window.visualViewport?.height ?? Infinity;
  return Math.min(window.innerHeight, document.documentElement.clientHeight || Infinity, vv);
}

const item =
  "relative flex min-h-14 min-w-12 max-w-full flex-[1_0_auto] flex-col items-center justify-center gap-1 bg-surface px-1 py-1.5 text-center text-sm leading-[1.4286] font-semibold text-muted-foreground shadow-[inset_0_0_0_1px_var(--du-border)] hover:bg-raised hover:text-text focus-visible:z-10";
const rotulo = "block max-w-full whitespace-nowrap [overflow-wrap:normal] [word-break:normal] hyphens-none";
const atual =
  "bg-raised text-brand shadow-[inset_0_4px_0_var(--du-brand),inset_0_0_0_1px_var(--du-border)] [&_span]:underline [&_span]:underline-offset-[0.15em]";
// Item atual com foco: mantém o filete interno e acrescenta a faixa preta (o outline branco vem do foco global).
const atualFoco =
  "focus-visible:shadow-[inset_0_4px_0_var(--du-brand),inset_0_0_0_1px_var(--du-border),0_0_0_3px_#000]";

export function Hotbar() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const ref = useRef<HTMLElement>(null);
  // false no servidor e na hidratação (sem JS, "Mais" é um link); true depois.
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [fixa, setFixa] = useState(false);
  const fixaRef = useRef(false);
  const menuAberto = useMenu((s) => s.open);
  const abrirMenu = useMenu((s) => s.openFrom);
  const armar = useMenu((s) => s.arm);
  const lightboxAberta = useLightbox((s) => s.index !== null);

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    // Sem medição, a barra fica no fluxo.
    if (!el || typeof ResizeObserver === "undefined") return;
    const faixa = window.matchMedia("(min-width: 22.5rem) and (max-width: 47.999rem)");

    const medir = () => {
      const oculta = getComputedStyle(el).display === "none";
      const altura = oculta ? 0 : Math.ceil(el.getBoundingClientRect().height);
      const util = alturaUtil();
      const elegivel = faixa.matches && util >= 480 && altura > 0;
      const agora = !elegivel ? false : fixaRef.current ? altura <= util * FIXA_ATE : altura <= util * FIXA_DE;
      const reserva = agora ? altura + parseFloat(getComputedStyle(root).fontSize) * 1.5 : 0;
      root.style.setProperty("--du-hotbar-height", `${agora ? altura : 0}px`);
      root.style.setProperty("--du-bottom-reserve", `${reserva}px`);
      if (agora !== fixaRef.current) {
        fixaRef.current = agora;
        setFixa(agora);
      }
    };

    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("resize", medir, { passive: true });
    window.visualViewport?.addEventListener("resize", medir, { passive: true });
    faixa.addEventListener("change", medir);
    void document.fonts?.ready.then(medir);
    medir();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
      window.visualViewport?.removeEventListener("resize", medir);
      faixa.removeEventListener("change", medir);
      root.style.setProperty("--du-hotbar-height", "0px");
      root.style.setProperty("--du-bottom-reserve", "0px");
    };
  }, []);

  return (
    <nav
      ref={ref}
      aria-label="Navegação rápida"
      inert={menuAberto || lightboxAberta}
      className={cn(
        "z-20 border-t-2 border-border bg-surface pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:hidden",
        fixa && "fixed inset-x-0 bottom-0",
      )}
    >
      <div className="mx-auto flex w-[calc(100%-2rem)] flex-wrap gap-1">
        {itens.map(({ href, label, icon: Icon, ariaLabel }) => {
          const exata = pathname === href;
          const secao = !exata && href !== "/" && pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={prefetchFor(href)}
              aria-label={ariaLabel}
              aria-current={exata ? "page" : undefined}
              className={cn(item, (exata || secao) && atual, (exata || secao) && atualFoco)}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              <span className={rotulo}>{label}</span>
            </Link>
          );
        })}
        {montado ? (
          <button
            type="button"
            aria-label="Mais: abrir menu"
            aria-haspopup="dialog"
            aria-expanded={menuAberto}
            onPointerDown={armar}
            onFocus={armar}
            onClick={(e) => abrirMenu(e.currentTarget)}
            className={item}
          >
            <Menu aria-hidden="true" className="size-5 shrink-0" />
            <span className={rotulo}>Mais</span>
          </button>
        ) : (
          // Sem JavaScript, "Mais" leva ao menu completo do rodapé.
          <a href="#menu-completo" aria-label="Mais: ir para o menu completo" className={item}>
            <Menu aria-hidden="true" className="size-5 shrink-0" />
            <span className={rotulo}>Mais</span>
          </a>
        )}
      </div>
    </nav>
  );
}

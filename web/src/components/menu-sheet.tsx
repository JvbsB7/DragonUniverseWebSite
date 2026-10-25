"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { buttonClass } from "@/components/button";
import { ReduzirAnimacoes } from "@/components/reduzir-animacoes";
import { links } from "@/config/links";
import { siteConfig } from "@/config/site";
import { prefetchFor } from "@/lib/prefetch";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLElement | null>;
};

const linkClass = "flex min-h-12 items-center rounded-md border-b border-edge px-2 text-base text-text hover:text-brand hover:underline";

// Menu completo v3 (design r1 §1): diálogo em tela cheia no celular, com foco preso, fundo inerte, Esc fecha e o foco
// volta ao acionador. Ordem: cabeçalho (Menu / Fechar menu), Discord, links principais, grupo "Mais".
// Entrada de até 220 ms (opacidade + 12 px), saída de até 180 ms; com movimento reduzido a regra global zera as transições.
export default function MenuSheet({ open, onOpenChange, returnFocusTo }: Props) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const closeRef = useRef<HTMLButtonElement>(null);

  const renderLink = (item: { href: string; label: string }) => {
    const current = pathname === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          prefetch={prefetchFor(item.href)}
          aria-current={current ? "page" : undefined}
          onClick={() => onOpenChange(false)}
          className={cn(linkClass, current && "font-semibold text-brand underline underline-offset-[0.2em]")}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup
          aria-label="Menu de navegação"
          finalFocus={returnFocusTo}
          initialFocus={closeRef}
          className="fixed inset-0 z-50 flex h-dvh max-h-dvh w-full flex-col bg-surface text-text transition duration-220 ease-du-out data-ending-style:translate-y-3 data-ending-style:opacity-0 data-ending-style:duration-180 data-starting-style:translate-y-3 data-starting-style:opacity-0"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-edge p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
            <Dialog.Title className="font-display text-2xl font-bold">Menu</Dialog.Title>
            <Dialog.Close ref={closeRef} className={buttonClass("secondary")}>
              Fechar menu
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Entrar no Discord, abre em nova aba"
              className={cn(buttonClass("primary", "lg"), "w-full")}
            >
              Entrar no Discord
            </a>
            <nav aria-label="Navegação no menu" className="grid gap-5">
              <ul className="grid gap-1">{siteConfig.nav.map(renderLink)}</ul>
              <div>
                <h2 className="font-display text-lg font-semibold text-muted-foreground">Mais</h2>
                <ul className="mt-1 grid gap-1">{siteConfig.mais.map(renderLink)}</ul>
              </div>
            </nav>
            {/* Mesmo estado do rodapé e da batalha (v4-03 §3.3), depois dos links de "Mais". */}
            <ReduzirAnimacoes id="reduzir-menu" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

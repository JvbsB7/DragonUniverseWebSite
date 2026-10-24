"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type RefObject } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { links } from "@/config/links";
import { prefetchFor } from "@/lib/prefetch";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; group: "atalhos" | "resto" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly Item[];
  returnFocusTo: RefObject<HTMLElement | null>;
};

const linkClass = "flex min-h-12 items-center border-b border-raised px-1 text-base text-text hover:text-brand hover:underline";

// Menu completo (shadcn Sheet): foco preso, Esc fecha e o foco volta ao acionador (botão do cabeçalho ou "Mais").
export default function MenuSheet({ open, onOpenChange, items, returnFocusTo }: Props) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const closeRef = useRef<HTMLButtonElement>(null);
  const atalhos = items.filter((i) => i.group === "atalhos");
  const resto = items.filter((i) => i.group === "resto");

  const renderLink = (item: Item, extra?: string) => {
    const current = pathname === item.href;
    return (
      <li key={item.href} className={extra}>
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-label="Menu de navegação"
        finalFocus={returnFocusTo}
        initialFocus={closeRef}
        className="max-h-dvh gap-0 border-l-2 border-border p-0 data-[side=right]:w-full data-[side=right]:max-w-md data-[side=right]:sm:max-w-md"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b-2 border-border p-5">
          <SheetTitle className="text-2xl">Menu</SheetTitle>
          <SheetClose
            ref={closeRef}
            className={cn(buttonVariants({ variant: "outline" }), "shadow-none")}
          >
            Fechar menu
          </SheetClose>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <a
            href={links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "w-full")}
          >
            Entrar no Discord
            <span className="sr-only"> (abre em uma nova aba)</span>
          </a>
          <nav aria-label="Navegação no menu">
            <ul className="grid gap-1">
              {atalhos.map((i) => renderLink(i))}
              {resto.map((i, n) => renderLink(i, n === 0 ? "mt-3 border-t-2 border-border pt-3" : undefined))}
              <li>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Ver no GitHub
                  <span className="sr-only"> (abre em uma nova aba)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Navegação principal do desktop. `aria-current="page"` só na página exata; a seção ancestral só ganha o sublinhado.
export function HeaderNav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return (
    <nav aria-label="Navegação principal" className="hidden w-full flex-wrap items-center gap-x-6 gap-y-1 pb-3 nav:flex">
      {siteConfig.nav.map((item) => {
        const exact = pathname === item.href;
        const section = !exact && pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={exact ? "page" : undefined}
            className={cn(
              "inline-flex min-h-12 items-center font-display text-base font-semibold hover:text-brand hover:underline",
              exact || section ? "text-brand underline underline-offset-[0.3em]" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

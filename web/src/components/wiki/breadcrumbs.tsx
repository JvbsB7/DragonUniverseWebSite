import Link from "next/link";
import { prefetchFor } from "@/lib/prefetch";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está aqui" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden="true" className="size-4" />}
            {c.href ? (
              <Link href={c.href} prefetch={prefetchFor(c.href)} className="inline-flex min-h-12 items-center underline underline-offset-4 hover:text-text">{c.label}</Link>
            ) : (
              <span aria-current="page" className="inline-flex min-h-12 items-center text-text [overflow-wrap:anywhere]">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

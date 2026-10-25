"use client";

import { useState, useSyncExternalStore } from "react";
import { Gallery } from "@/components/gallery";
import { categoriasGaleria, type GaleriaItem } from "@/config/galeria";
import { cn } from "@/lib/utils";

// Filtros da galeria (v3-04-design.md §9.7): só categorias com material real, botões com aria-pressed e resultado anunciado.
// Cada imagem aparece em uma única categoria (sem repetir para inflar o volume). O lightbox navega só pelo filtro atual.
const semAssinatura = () => () => {};

export function GalleryFilter({ items }: { items: GaleriaItem[] }) {
  const [filtro, setFiltro] = useState<(typeof categoriasGaleria)[number]["id"]>("todas");
  // Sem JavaScript os filtros não funcionam: ficam invisíveis (o espaço é reservado, sem salto de layout) e saem da leitura.
  const hidratado = useSyncExternalStore(semAssinatura, () => true, () => false);
  const lista = filtro === "todas" ? items : items.filter((i) => i.categoria === filtro);
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="Filtrar imagens por categoria" aria-hidden={!hidratado} inert={!hidratado} className={cn("flex flex-wrap gap-2", !hidratado && "invisible")}>
        {categoriasGaleria.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filtro === c.id}
            onClick={() => setFiltro(c.id)}
            className={cn(
              "inline-flex min-h-12 max-w-full items-center rounded-md border px-4 text-base font-semibold",
              filtro === c.id ? "border-brand bg-brand text-bg" : "border-border bg-surface text-text hover:bg-raised",
            )}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
      <p aria-live="polite" aria-hidden={!hidratado} className={cn("text-sm text-muted-foreground", !hidratado && "invisible")}>
        {lista.length} {lista.length === 1 ? "imagem" : "imagens"}.
      </p>
      <Gallery key={filtro} items={lista} />
    </div>
  );
}

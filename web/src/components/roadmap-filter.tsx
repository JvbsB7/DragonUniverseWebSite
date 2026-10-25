"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const filtros = [
  { id: "todos", rotulo: "Todos" },
  { id: "live", rotulo: "Já no jogo" },
  { id: "dev", rotulo: "Em desenvolvimento" },
  { id: "test", rotulo: "Em teste" },
  { id: "planned", rotulo: "Planejado" },
] as const;

// Filtro de status do roadmap (design §9.5). As seções existem no HTML e só são ocultadas por CSS (data-filtro), então sem
// JavaScript tudo continua visível. "Planejado" inclui o Conteúdo Futuro. Sem barras, percentuais nem datas.
export function RoadmapFilter({ children }: { children: ReactNode }) {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["id"]>("todos");
  const [mudou, setMudou] = useState(false);
  return (
    <div data-filtro={filtro} className="grid gap-8">
      <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => {
              setMudou(true);
              setFiltro(f.id);
            }}
            className={cn(
              "inline-flex min-h-12 max-w-full items-center rounded-md border px-4 text-base font-semibold [overflow-wrap:anywhere]",
              filtro === f.id ? "border-brand bg-brand text-bg" : "border-border bg-surface text-text hover:bg-raised",
            )}
          >
            {f.rotulo}
          </button>
        ))}
      </div>
      {/* WCAG 4.1.3: o resultado do filtro é anunciado (só depois da 1ª troca, para não ler nada ao carregar). */}
      <p role="status" className="sr-only">
        {mudou ? (filtro === "todos" ? "Mostrando todas as seções." : `Mostrando só: ${filtros.find((f) => f.id === filtro)?.rotulo}.`) : ""}
      </p>
      {children}
    </div>
  );
}

"use client";

import { useId, useState, type ReactNode } from "react";

// Cartão que expande ("Mostrar mais" / "Mostrar menos", aria-expanded). A expansão usa a transição de grade do CSS
// (grid-template-rows 0fr → 1fr, até 220 ms, sem altura fixa); o conteúdo recolhido fica inerte e fora da leitura.
export function Expandable({ children, rotulo = "Mostrar mais", rotuloAberto = "Mostrar menos", montarAoAbrir = false }: { children: ReactNode; rotulo?: string; rotuloAberto?: string; montarAoAbrir?: boolean }) {
  const [aberto, setAberto] = useState(false);
  // Com `montarAoAbrir`, o conteúdo (ex.: imagens) só entra no DOM na primeira abertura e não pesa antes disso.
  const [montado, setMontado] = useState(false);
  const id = useId();
  return (
    <div className="grid gap-2">
      <div id={id} className="expandable" data-aberto={aberto}>
        <div className="overflow-hidden" inert={!aberto}>
          {(!montarAoAbrir || montado) && children}
        </div>
      </div>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => {
          setMontado(true);
          setAberto((v) => !v);
        }}
        className="inline-flex min-h-12 w-fit items-center rounded-md px-1 text-base font-semibold text-brand underline underline-offset-4"
      >
        {aberto ? rotuloAberto : rotulo}
      </button>
    </div>
  );
}

"use client";

import { useState, useSyncExternalStore } from "react";
import { definirReduzir } from "@/lib/perfil";
import { useReduzir } from "@/lib/use-qualidade";

// Controle "Reduzir animações" (copy v4 §9). Se o sistema já pede menos movimento, fica ligado e travado.
// Posição provisória: rodapé (a Prisma confirma). A escolha fica salva neste aparelho (localStorage, com try/catch em perfil.ts).
export function ReduzirAnimacoes() {
  const { reduzir, sistema } = useReduzir();
  // Só depois de hidratar: antes disso o servidor não sabe o estado, e o botão não pode piscar errado.
  const pronto = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [aviso, setAviso] = useState("");
  const ligado = sistema || reduzir;

  return (
    <div className="grid max-w-prose gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={pronto ? ligado : false}
        aria-label="Reduzir animações"
        disabled={sistema}
        onClick={() => {
          definirReduzir(!reduzir);
          setAviso(!reduzir ? "Animações reduzidas." : "Animações completas.");
        }}
        className="inline-flex min-h-12 items-center gap-3 rounded-md text-left text-text disabled:cursor-not-allowed"
      >
        <span
          aria-hidden="true"
          className={`relative h-6 w-11 shrink-0 rounded-full border border-edge transition-colors ${pronto && ligado ? "bg-action" : "bg-bg"}`}
        >
          <span className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-text transition-transform ${pronto && ligado ? "translate-x-5" : ""}`} />
        </span>
        <span className="font-semibold">{pronto && ligado ? "Animações reduzidas" : "Animações completas"}</span>
      </button>
      <p>
        {pronto && sistema
          ? "Seu aparelho pede menos movimento, então as animações estão reduzidas."
          : "Deixa o site mais leve e sem movimento forte. O conteúdo é o mesmo."}
        {pronto && reduzir && !sistema ? " Lembramos sua escolha neste aparelho." : ""}
      </p>
      <p role="status" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}

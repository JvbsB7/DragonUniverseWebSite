"use client";

import { useState, useSyncExternalStore } from "react";
import { definirReduzir } from "@/lib/perfil";
import { useQualidade, useReduzir } from "@/lib/use-qualidade";

// Controle "Reduzir animações" (copy v4 §9; v4-03 §3.3: no rodapé, no menu completo e junto da batalha, todos no mesmo estado).
// O nome acessível é o próprio texto visível ("Reduzir animações" + estado). Se o sistema já pede menos movimento, o botão
// fica ligado, focável (aria-disabled, sem `disabled`) e a explicação está visível e ligada por aria-describedby.
// A escolha fica salva neste aparelho (localStorage, com try/catch em perfil.ts).
export function ReduzirAnimacoes({ id = "reduzir" }: { id?: string }) {
  const { reduzir, sistema } = useReduzir();
  const nivel = useQualidade();
  // Economia de dados também leva ao nível estático: o controle reflete o nível realmente usado.
  const dados = nivel === "estatico" && !reduzir && !sistema;
  // Só depois de hidratar: antes disso o servidor não sabe o estado, e o botão não pode piscar errado.
  const pronto = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [aviso, setAviso] = useState("");
  const ligado = pronto && (sistema || reduzir || dados);
  const travado = pronto && (sistema || dados);
  const apoio =
    pronto && sistema
      ? "Seu aparelho pede menos movimento, então as animações estão reduzidas."
      : pronto && dados
        ? "O modo de economia de dados está ativo, então as animações estão reduzidas."
        : "Deixa o site mais leve e sem movimento forte. O conteúdo é o mesmo.";

  return (
    <div className="grid max-w-prose gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-disabled={travado}
        aria-describedby={`${id}-apoio`}
        onClick={() => {
          if (sistema || dados) return;
          definirReduzir(!reduzir);
          setAviso(!reduzir ? "Animações reduzidas. O conteúdo é o mesmo." : "Animações completas. As cenas não recomeçam sozinhas.");
        }}
        className="inline-flex min-h-12 items-center gap-3 rounded-md text-left text-text aria-disabled:cursor-not-allowed"
      >
        <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full border border-edge transition-colors ${ligado ? "bg-action" : "bg-bg"}`}>
          <span className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-text transition-transform ${ligado ? "translate-x-5" : ""}`} />
        </span>
        <span className="grid">
          <span className="font-semibold">Reduzir animações</span>
          <span className="text-sm text-muted-foreground">{ligado ? "Animações reduzidas" : "Animações completas"}</span>
        </span>
      </button>
      <p id={`${id}-apoio`}>
        {apoio}
        {pronto && reduzir && !sistema ? " Lembramos sua escolha neste aparelho." : ""}
      </p>
      <p role="status" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}

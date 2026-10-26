"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { ESFERAS, useEsferasStore, type IdEsfera } from "@/store/esferas";

// Uma esfera escondida num nicho da Home (v4-03 §9.2). Botão de 48 × 48 px com o sprite aprovado (7 marcas; linhas: normal,
// brilho, coletada). Coleta em 280 ms só com CSS. Brilho estático no hover/foco. Depois de coletada continua no DOM e no lugar.
export function Esfera({ id }: { id: IdEsfera }) {
  const carregar = useEsferasStore((s) => s.carregar);
  const coletadas = useEsferasStore((s) => s.coletadas);
  const coletar = useEsferasStore((s) => s.coletar);
  const ultima = useEsferasStore((s) => s.ultima);
  const fechamento = useEsferasStore((s) => s.fechamento);
  const [animando, setAnimando] = useState(false);
  useEffect(() => carregar(), [carregar]);
  const coletada = coletadas.includes(id);
  const coluna = ESFERAS.indexOf(id);
  const completa = coletadas.length === ESFERAS.length;

  return (
    <div className="flex items-center justify-end gap-3">
      {completa && ultima === id && fechamento > 0 && (
        <p className="text-sm font-semibold">
          Você achou as 7 esferas! <LinkColecao />
        </p>
      )}
      <button
        type="button"
        aria-label={coletada ? `Esfera ${coluna + 1} de 7: esfera de energia coletada.` : `Esfera ${coluna + 1} de 7: esfera de energia escondida. Ative para coletar.`}
        onClick={() => {
          coletar(id);
          if (!coletada) {
            setAnimando(true);
            window.setTimeout(() => setAnimando(false), 280);
          }
        }}
        data-esfera={coletada ? "coletada" : "escondida"}
        data-animando={animando || undefined}
        className="esfera-botao relative grid size-12 place-items-center rounded-md"
        style={{
          ["--e1" as string]: `url(${urlSprite(1)})`,
          ["--e2" as string]: `url(${urlSprite(2)})`,
          ["--ex" as string]: `${-coluna * 48}px`,
        }}
      >
        <span aria-hidden="true" className="esfera-sprite" />
        {animando && (
          <span aria-hidden="true" className="esfera-fagulhas">
            <i />
            <i />
            <i />
          </span>
        )}
      </button>
    </div>
  );
}

/** Nicho decorativo no fim de uma seção: alinhado à borda direita e separado do conteúdo por pelo menos 24 px. */
export function EsferaNicho({ id }: { id: IdEsfera }) {
  return (
    <div className="mt-8">
      <Esfera id={id} />
    </div>
  );
}

export function LinkColecao() {
  return (
    <Link href="#colecao-esferas" aria-label="Ver a coleção de esferas de energia" className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">
      Ver a coleção
    </Link>
  );
}

export const urlSprite = (x: 1 | 2) => asset(`/img/esferas/esferas-${x}x.webp`);

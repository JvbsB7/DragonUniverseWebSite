"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/button";
import { useReduzir } from "@/lib/use-qualidade";
import { useFalaStore, type ContextoDeFala } from "@/store/fala";

const PERMANENCIA = 6000;
const TRANSICAO = 120;
const ALINHAR = { esquerda: "justify-start", centro: "justify-center", direita: "justify-end" } as const;

// Balão pixel em HTML (v4-15 §0.2): painel opaco, texto escuro, degraus de 4 px e cauda quadrada voltada à pessoa. Entra e sai por
// opacidade (120 ms), fica 6 s, e a contagem para com o mouse ou o foco dentro. Fala por ação do visitante é anunciada uma vez;
// a automática é decorativa (aria-hidden). Com movimento reduzido, a fala por ação aparece parada e fica até fechar.
export function FalaSlot({ contexto, className = "", faixa }: { contexto: ContextoDeFala; className?: string; faixa?: string }) {
  const atual = useFalaStore((s) => s.atual);
  const ultima = useFalaStore((s) => s.ultima[contexto]);
  const { falar, fechar } = useFalaStore.getState();
  const { reduzir, sistema } = useReduzir();
  const reduzido = reduzir || sistema;
  const mostrando = atual?.contexto === contexto && (!faixa || atual.faixa === faixa) ? atual : null;
  const lateral = mostrando?.lateral;
  const [pausado, setPausado] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!mostrando || mostrando.semLimite || (reduzido && mostrando.acao) || pausado) return;
    const sai = window.setTimeout(() => setSaindo(true), PERMANENCIA);
    const fim = window.setTimeout(() => {
      fechar(contexto);
      setSaindo(false);
    }, PERMANENCIA + TRANSICAO);
    return () => {
      clearTimeout(sai);
      clearTimeout(fim);
    };
    // A chave identifica cada fala; `fechar` é estável.
  }, [mostrando?.chave, pausado, reduzido, contexto, fechar]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className} style={lateral ? { [lateral.lado === "esquerda" ? "right" : "left"]: lateral.pos } : undefined}>
      <p role="status" aria-live="polite" className="sr-only">
        {mostrando?.acao ? `${mostrando.locutor} diz: ${mostrando.texto}` : ""}
      </p>
      {mostrando ? (
        <div className={lateral ? "flex" : `flex ${ALINHAR[mostrando.cauda]}`} onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocus={() => setPausado(true)} onBlur={() => setPausado(false)}>
          <div
            key={mostrando.chave}
            className="balao"
            data-cauda={lateral ? undefined : mostrando.cauda}
            data-lado={lateral?.lado}
            data-saindo={saindo || undefined}
            data-parado={reduzido || undefined}
            aria-hidden={mostrando.acao ? undefined : true}
          >
            <div className="balao-borda">
              <div className="balao-corpo">
                <p className="min-w-0 flex-1 py-3 pl-4 [overflow-wrap:anywhere]">
                  <span className="sr-only">{mostrando.locutor} diz: </span>
                  {mostrando.texto}
                </p>
                <button
                  type="button"
                  aria-label="Fechar fala"
                  tabIndex={mostrando.acao ? undefined : -1}
                  onClick={() => fechar(contexto)}
                  className="grid h-12 w-12 shrink-0 place-items-center text-[#060A16]"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        contexto !== "dragao" && contexto !== "nuvem" &&
        ultima && (
          <button
            type="button"
            aria-label={`Ler a fala de ${ultima.locutor}`}
            onClick={() => falar({ contexto, locutor: ultima.locutor, texto: ultima.texto, cauda: ultima.cauda, acao: true, semLimite: true })}
            className={buttonClass("secondary")}
          >
            Ler a fala
          </button>
        )
      )}
    </div>
  );
}

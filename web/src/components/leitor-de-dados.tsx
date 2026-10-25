"use client";

import { useId, useRef, useState } from "react";
import { ocuparNuvem } from "@/store/nuvem";
import type { DadosDaRaca } from "@/lib/dados-da-raca";

// Leitor de dados (v4-03 §10; "Scouter" é nome interno): botão real, painel no próprio cartão, texto imediato e uma varredura
// única de ≤ 240 ms só sobre a mídia (via data-leitura no cartão; o CSS faz a varredura). Sem JS o link "Ver detalhes" segue valendo.
export function LeitorDeDados({ nome, dados }: { nome: string; dados: DadosDaRaca }) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState("");
  const botao = useRef<HTMLButtonElement>(null);

  const alternar = () => {
    ocuparNuvem(2500);
    const proximo = !aberto;
    setAberto(proximo);
    setAviso(proximo ? `Dados de ${nome} abertos.` : `Dados de ${nome} fechados.`);
    const cartao = botao.current?.closest<HTMLElement>("[data-race]");
    if (cartao) {
      if (proximo) {
        // Reinicia a varredura mesmo em aberturas seguidas.
        delete cartao.dataset.leitura;
        void cartao.offsetWidth;
        cartao.dataset.leitura = "varrendo";
      } else delete cartao.dataset.leitura;
    }
  };

  return (
    <div className="grid gap-2">
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        aria-label={aberto ? `Fechar dados de ${nome}` : `Ler os dados de ${nome}`}
        onClick={alternar}
        className="inline-flex min-h-12 w-fit items-center rounded-md border border-border px-3 text-base font-semibold text-brand [overflow-wrap:anywhere]"
      >
        {aberto ? "Fechar dados" : "Ler os dados"}
      </button>
      <div id={id} hidden={!aberto} className="leitor-painel grid gap-3 rounded-md border border-brand/60 bg-bg p-4">
        <p className="font-game text-sm font-semibold">Dados de {nome}</p>
        <section className="grid gap-1" aria-label="Status">
          <p className="font-game text-xs font-semibold text-muted-foreground">Status</p>
          <p>Já no jogo</p>
        </section>
        {dados.bonus.length > 0 && (
          <section className="grid gap-1" aria-label="Bônus da raça">
            <p className="font-game text-xs font-semibold text-muted-foreground">Bônus da raça</p>
            {dados.bonus.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </section>
        )}
        {dados.formas.length > 0 && (
          <section className="grid gap-1" aria-label="Formas">
            <p className="font-game text-xs font-semibold text-muted-foreground">Formas</p>
            <p>{dados.formas.length} formas, em ordem de nível mínimo.</p>
            <ul className="grid gap-0.5 text-sm">
              {dados.formas.map((f) => (
                <li key={f.nome}>
                  {f.nome}
                  {f.nivel !== null ? ` · nível ${f.nivel}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
        {dados.habilidades && (
          <section className="grid gap-1" aria-label="Habilidades iniciais">
            <p className="font-game text-xs font-semibold text-muted-foreground">Habilidades iniciais</p>
            <p>{dados.habilidades}.</p>
          </section>
        )}
        <p className="text-sm text-muted-foreground">Dados da versão de teste 1.7.1E. Podem mudar entre versões.</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}

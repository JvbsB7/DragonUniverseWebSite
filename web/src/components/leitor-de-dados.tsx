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
    // Os cartões vizinhos não esticam quando este abre: cada um segura a altura que já tinha e a linha cresce só para o cartão aberto.
    const lista = botao.current?.closest("ul");
    const item = botao.current?.closest("li");
    if (lista && item) {
      const itens = Array.from(lista.children) as HTMLElement[];
      if (proximo) {
        const alturas = itens.map((li) => li.offsetHeight);
        itens.forEach((li, i) => {
          li.style.alignSelf = "start";
          if (li !== item) li.style.height = `${alturas[i]}px`;
          else li.style.minHeight = `${alturas[i]}px`;
        });
      } else if (!lista.querySelector('button[aria-expanded="true"]:not([aria-controls="' + id + '"])')) {
        itens.forEach((li) => {
          li.style.alignSelf = "";
          li.style.height = "";
          li.style.minHeight = "";
        });
      }
    }
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
        <div className="grid gap-1">
          <p className="font-game text-xs font-semibold text-muted-foreground">Status</p>
          <p>Já no jogo</p>
        </div>
        {dados.bonus.length > 0 && (
          <div className="grid gap-1">
            <p className="font-game text-xs font-semibold text-muted-foreground">Bônus da raça</p>
            {dados.bonus.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
        )}
        {dados.formas.length > 0 && (
          <div className="grid gap-1">
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
          </div>
        )}
        {dados.habilidades && (
          <div className="grid gap-1">
            <p className="font-game text-xs font-semibold text-muted-foreground">Habilidades iniciais</p>
            <p>{dados.habilidades}.</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Dados da versão de teste 1.7.1E. Podem mudar entre versões.</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}

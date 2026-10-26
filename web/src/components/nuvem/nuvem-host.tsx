"use client";

import { useEffect } from "react";
import { useBatalhaStore } from "@/store/batalha";
import { useLightbox } from "@/store/lightbox";
import { useMenu } from "@/store/menu";
import { gravarContagem, lerContagem, ocupacao, useNuvem } from "@/store/nuvem";
import { qualidadeAtual } from "@/lib/perfil";
import { temParametroQA } from "@/lib/qa";
import { useQualidade } from "@/lib/use-qualidade";
import { faixas, rolagem } from "./faixas";

// Agenda a nuvem dourada (v4-03 §8.3): 1ª elegibilidade após 20 s de visita, com a faixa inteira à vista e a rolagem parada
// por 2 s; a 2ª só 90 s depois e em outra faixa; no máximo 2 por visita (1 no nível baixo); nunca com movimento reduzido.
// Teste (só em build de QA, NEXT_PUBLIC_DU_QA=1): `?nuvem=1` ignora as esperas e solta a nuvem na primeira faixa visível.
const INICIO = typeof performance !== "undefined" ? Date.now() - performance.now() : 0;

export function NuvemHost() {
  const nivel = useQualidade();
  const anuncio = useNuvem((s) => s.anuncio);

  useEffect(() => {
    if (nivel === "estatico") return;
    const forcado = process.env.NEXT_PUBLIC_DU_QA === "1" && temParametroQA("nuvem");
    const rolou = () => (rolagem.ultima = Date.now());
    window.addEventListener("scroll", rolou, { passive: true });
    const tick = window.setInterval(() => {
      const agora = Date.now();
      if (document.hidden || useNuvem.getState().ativa) return;
      const q = qualidadeAtual();
      if (q === "estatico") return;
      const c = lerContagem();
      const limite = q === "baixo" ? 1 : 2;
      if (!forcado && (c.n >= limite || agora - INICIO < 20000 || (c.n > 0 && agora - c.ultima < 90000))) return;
      if (forcado && c.n >= 1) return;
      const ocupado =
        useMenu.getState().open ||
        useLightbox.getState().index !== null ||
        useBatalhaStore.getState().status === "tocando" ||
        agora < ocupacao.ate ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName ?? "");
      if (ocupado) return;
      const espera = forcado ? 0 : 2000;
      if (!forcado && agora - rolagem.ultima < espera) return;
      const candidata = [...faixas.values()].find((f) => f.visivelDesde !== null && agora - f.visivelDesde >= espera && f.id !== c.faixa);
      if (!candidata) return;
      gravarContagem({ n: c.n + 1, ultima: agora, faixa: candidata.id });
      useNuvem.getState().iniciar(candidata.id);
    }, 500);
    return () => {
      window.removeEventListener("scroll", rolou);
      window.clearInterval(tick);
    };
  }, [nivel]);

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {anuncio}
    </p>
  );
}

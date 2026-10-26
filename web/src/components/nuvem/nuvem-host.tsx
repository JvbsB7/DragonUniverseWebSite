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

// Agenda a nuvem dourada (D45/D46): 1ª elegibilidade após 6 s de visita, com a faixa à vista e a rolagem parada por 1 s; as seguintes só
// 45 s depois e em faixas diferentes; no máximo 3 por visita (2 no nível baixo); nunca com movimento reduzido. No celular, se até 20 s
// ninguém parou a rolagem diante de uma faixa, a 1ª passagem sai sem exigir a parada (garante uma passagem numa visita de ~30 s).
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
      const limite = q === "baixo" ? 2 : 3;
      if (!forcado && (c.n >= limite || agora - INICIO < 6000 || (c.n > 0 && agora - c.ultima < 45000))) return;
      if (forcado && c.n >= 1) return;
      const ocupado =
        useMenu.getState().open ||
        useLightbox.getState().index !== null ||
        useBatalhaStore.getState().status === "tocando" ||
        agora < ocupacao.ate ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName ?? "");
      if (ocupado) return;
      const celular = !window.matchMedia("(min-width: 48rem)").matches;
      const semParada = forcado || (celular && c.n === 0 && agora - INICIO >= 20000);
      const espera = semParada ? 0 : 1000;
      if (!semParada && agora - rolagem.ultima < espera) return;
      const usadas = c.usadas ?? (c.faixa ? [c.faixa] : []);
      const candidata = [...faixas.values()].find((f) => f.visivelDesde !== null && agora - f.visivelDesde >= espera && !usadas.includes(f.id));
      if (!candidata) return;
      gravarContagem({ n: c.n + 1, ultima: agora, faixa: candidata.id, usadas: [...usadas, candidata.id] });
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

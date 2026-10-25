"use client";

import { useSyncExternalStore } from "react";
import { assinarQualidade, qualidadeAtual, reduzirAtivo, sistemaPedeMenos, type Qualidade } from "@/lib/perfil";

/** Nível de qualidade atual; reage ao botão "Reduzir animações" e à degradação por quadros lentos. No servidor: "estatico". */
export function useQualidade(): Qualidade {
  return useSyncExternalStore(assinarQualidade, qualidadeAtual, () => "estatico");
}

/** Estado do botão "Reduzir animações" e se o sistema já pede menos movimento. */
export function useReduzir() {
  const reduzir = useSyncExternalStore(assinarQualidade, reduzirAtivo, () => false);
  const sistema = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    sistemaPedeMenos,
    () => false,
  );
  return { reduzir, sistema };
}

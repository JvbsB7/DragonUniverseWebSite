"use client";

import { useEffect, useId, useSyncExternalStore, type RefObject } from "react";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";
import { assinarQualidade, perfilLeve } from "@/lib/perfil";

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  const sair = assinarQualidade(cb);
  return () => {
    mq.removeEventListener("change", cb);
    sair();
  };
}
// Perfil completo (decisão M7): sem movimento reduzido, sem economia de dados, > 4 núcleos, ≥ 768 px e ponteiro fino.
const perfilCompleto = () => !perfilLeve();

let webglSupport: boolean | undefined;

// Testa o WebGL uma única vez, só quando um canvas vai mesmo ser pedido (não durante a hidratação).
export function hasWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") ?? c.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      webglSupport = gl !== null;
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/** 3D só no perfil completo (celular, movimento reduzido e aparelho fraco ficam em 2D). No servidor vale false (imagem estática). O WebGL é testado depois, ao pedir a vaga. */
export function use3dAllowed(): boolean {
  return useSyncExternalStore(subscribeMotion, perfilCompleto, () => false);
}

/** Pede uma vaga de canvas enquanto o elemento está na tela e a libera quando sai. */
export function useLiveCanvas(ref: RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const id = useId();
  const request = useSkinViewerStore((s) => s.request);
  const release = useSkinViewerStore((s) => s.release);
  const granted = useSkinViewerStore((s) => s.live.includes(id));
  const interacted = useSkinViewerStore((s) => s.interacted);
  const active = enabled && interacted;

  useEffect(() => {
    if (enabled) armFirstInteraction();
  }, [enabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let dentro = false;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        dentro = entry.isIntersecting;
        if (dentro && !document.hidden && hasWebGL()) request(id);
        else if (!dentro) release(id);
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    // Aba oculta por mais de 5 s: devolve a vaga e libera o contexto; ao voltar, pede de novo se ainda estiver na tela.
    const aba = () => {
      clearTimeout(timer);
      if (document.hidden) timer = window.setTimeout(() => release(id), 5000);
      else if (dentro && hasWebGL()) request(id);
    };
    document.addEventListener("visibilitychange", aba);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", aba);
      clearTimeout(timer);
      release(id);
    };
  }, [active, id, ref, request, release]);

  return active && granted;
}

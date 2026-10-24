"use client";

import { useEffect, useId, useSyncExternalStore, type RefObject } from "react";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

/** 3D só sem prefers-reduced-motion. No servidor vale false (imagem estática). O WebGL é testado depois, ao pedir a vaga. */
export function use3dAllowed(): boolean {
  return !useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
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
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting && hasWebGL() ? request(id) : release(id)), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      release(id);
    };
  }, [active, id, ref, request, release]);

  return active && granted;
}

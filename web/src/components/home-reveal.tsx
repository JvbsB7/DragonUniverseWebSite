"use client";

import { useEffect } from "react";
import { perfilLeve } from "@/lib/perfil";
import { armFirstInteraction, useSkinViewerStore } from "@/store/skin-viewer";

// Revelação das seções da Home com GSAP + ScrollTrigger (v3-01 §0.2, item 7). SOB DEMANDA: o pacote (~45 KB gz) só é
// baixado depois da primeira interação e só no perfil completo (desktop). Só anima, uma vez, elementos [data-reveal] que estão
// ABAIXO da dobra (até 8 px de deslocamento e opacidade a partir de 0,6, 320 ms): o conteúdo nunca fica invisível, o
// H1 e a área visual do hero não participam e nenhum layout se move.
export function HomeReveal() {
  useEffect(() => {
    // Perfil leve (movimento reduzido, economia de dados, ≤ 4 núcleos, celular): nenhuma revelação e nenhum GSAP baixado.
    if (perfilLeve()) return;
    let cancelado = false;
    let limpar = () => {};
    const iniciar = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);
      const alvos = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      const gatilhos = ScrollTrigger.batch(alvos, {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(els, { y: 8, opacity: 0.6 }, { y: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: "power2.out", overwrite: true, clearProps: "transform,opacity" }),
      });
      limpar = () => gatilhos.forEach((g) => g.kill());
    };
    let cancelarAssinatura = () => {};
    if (useSkinViewerStore.getState().interacted) void iniciar();
    else {
      cancelarAssinatura = useSkinViewerStore.subscribe((s) => {
        if (s.interacted) {
          cancelarAssinatura();
          void iniciar();
        }
      });
      armFirstInteraction();
    }
    return () => {
      cancelado = true;
      cancelarAssinatura();
      limpar();
    };
  }, []);
  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { FALA_DO_ACENO, LOCUTOR } from "@/config/falas";
import { useFalaStore } from "@/store/fala";
import { asset } from "@/lib/asset";
import { useMenu } from "@/store/menu";
import { useLightbox } from "@/store/lightbox";
import { useBatalhaStore } from "@/store/batalha";
import { qualidadeAtual } from "@/lib/perfil";
import { ocupacao, useNuvem } from "@/store/nuvem";

// Quadros do sprite aprovado (Forja, nuvem-jvbsbr.json): voo 0–11 (loop, 12 fps), aceno 12–21, saída 22–27; 7 colunas.
const COLUNAS = 7;
const FPS = 12;
const ANIM = { voo: [0, 12], aceno: [12, 10], saida: [22, 6] } as const;
type Modo = keyof typeof ANIM;

// A nuvem cruza a faixa da esquerda para a direita (5 s no desktop, 4 s no celular) com leve flutuação vertical. É decorativa
// (aria-hidden, sem foco); só o sprite aceita um clique/toque do mouse: aceno de ~0,8 s, saída e fim. Pausa com a aba oculta e
// sai em até 150 ms se começar uma interação (menu, lightbox, batalha, viagem, seleção) ou se o movimento for reduzido.
export function Nuvem() {
  const encerrar = useNuvem((s) => s.encerrar);
  const anunciar = useNuvem((s) => s.anunciar);
  const raiz = useRef<HTMLDivElement>(null);
  const sprite = useRef<HTMLDivElement>(null);
  const modo = useRef<Modo>("voo");
  const quadro = useRef(0);
  const segura = useRef(0);
  const [saindo, setSaindo] = useState(false);
  const [pausada, setPausada] = useState(false);
  const [largo] = useState(() => window.matchMedia("(min-width: 48rem)").matches);
  const [aceno, setAceno] = useState(false);
  const L = largo ? { w: 172, h: 122, arq: "desktop", dur: 7 } : { w: 128, h: 92, arq: "celular", dur: 6 };
  // Celular (D46): no aceno a nuvem desacelera e para junto da borda mais próxima; `parada` guarda o `left` (px) da faixa.
  const [parada, setParada] = useState<number | null>(null);

  const sair = () => {
    setSaindo(true);
    window.setTimeout(encerrar, 150);
  };

  // Quadros do sprite a 12 fps, direto no DOM (sem re-render).
  useEffect(() => {
    if (pausada) return;
    const id = window.setInterval(() => {
      const [ini, n] = ANIM[modo.current];
      const i = quadro.current;
      if (modo.current !== "voo" && i >= n - 1) {
        if (modo.current === "aceno") {
          // Segura o último quadro do aceno por ~1,5 s para o balão aparecer ao lado dela antes de a nuvem seguir viagem.
          segura.current += 1;
          if (segura.current < 18) return;
          modo.current = "saida";
          quadro.current = 0;
        } else {
          window.clearInterval(id);
          encerrar();
          return;
        }
      } else quadro.current = modo.current === "voo" ? (i + 1) % n : i + 1;
      const frame = ANIM[modo.current][0] + quadro.current;
      const el = sprite.current;
      if (el) el.style.backgroundPosition = `${-(frame % COLUNAS) * L.w}px ${-Math.floor(frame / COLUNAS) * L.h}px`;
      void ini;
    }, 1000 / FPS);
    return () => window.clearInterval(id);
  }, [pausada, L.w, L.h, anunciar, encerrar]);

  // Pausa com a aba oculta; sai se começar uma interação ou se o nível cair para estático.
  useEffect(() => {
    const aba = () => setPausada(document.hidden);
    document.addEventListener("visibilitychange", aba);
    const verificar = window.setInterval(() => {
      const ocupada = useMenu.getState().open || useLightbox.getState().index !== null || useBatalhaStore.getState().status === "tocando" || Date.now() < ocupacao.ate;
      if (ocupada || qualidadeAtual() === "estatico") sair();
    }, 100);
    return () => {
      document.removeEventListener("visibilitychange", aba);
      window.clearInterval(verificar);
    };
    // `sair` só usa estados estáveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Balão do aceno (D37): do lado oposto ao voo (esquerda), ou à direita se faltar espaço; sem espaço nos dois lados, só o anúncio.
  const falarDoAceno = () => {
    const faixa = raiz.current?.parentElement?.parentElement;
    const caixa = sprite.current?.getBoundingClientRect();
    const area = faixa?.getBoundingClientRect();
    const id = faixa?.dataset.nuvemFaixa;
    if (!faixa || !caixa || !area || !id) return;
    const x = caixa.left - area.left;
    const LARGURA = 260; // balão de uma linha com o botão de fechar de 48 px
    const lateral =
      x - 8 >= LARGURA ? { lado: "esquerda" as const, pos: area.width - x + 8 } : area.width - (x + caixa.width) - 8 >= LARGURA ? { lado: "direita" as const, pos: x + caixa.width + 8 } : null;
    if (!largo) {
      // Para junto da borda mais próxima e põe o balão (até 2 linhas) no lado livre.
      const esq = x + caixa.width / 2 < area.width / 2;
      const alvo = esq ? 4 : area.width - caixa.width - 4;
      setParada(x);
      requestAnimationFrame(() => requestAnimationFrame(() => setParada(alvo)));
      const livre = area.width - caixa.width - 4 - 12;
      useFalaStore.getState().falar({
        contexto: "nuvem",
        ...LOCUTOR.joao,
        texto: FALA_DO_ACENO,
        acao: true,
        lateral: esq ? { lado: "direita", pos: alvo + caixa.width + 8, larguraMax: livre } : { lado: "esquerda", pos: area.width - alvo + 8, larguraMax: livre },
        faixa: id,
      });
      return;
    }
    if (!lateral) {
      anunciar("JvbsBR acenou e a nuvem seguiu viagem.");
      return;
    }
    useFalaStore.getState().falar({ contexto: "nuvem", ...LOCUTOR.joao, texto: FALA_DO_ACENO, acao: true, lateral, faixa: id });
  };

  const acenar = () => {
    if (aceno) return;
    setAceno(true);
    modo.current = "aceno";
    quadro.current = 0;
    falarDoAceno();
  };

  return (
    <div
      ref={raiz}
      onAnimationEnd={(e) => {
        if (e.animationName === "nuvem-cruza") encerrar();
      }}
      className="nuvem-cruza absolute top-1/2 -translate-y-1/2"
      style={{
        ["--dur" as string]: `${L.dur}s`,
        ["--w" as string]: `${L.w}px`,
        animationPlayState: pausada || aceno ? "paused" : "running",
        opacity: saindo ? 0 : 1,
        transition: parada !== null ? "opacity 150ms linear, left 500ms ease-out" : "opacity 150ms linear",
        ...(parada !== null ? { animation: "none", left: parada } : {}),
      }}
    >
      <div className="nuvem-bob" style={{ animationPlayState: pausada ? "paused" : "running" }}>
        <div
          ref={sprite}
          onClick={acenar}
          className="pointer-events-auto cursor-pointer"
          style={{
            width: L.w,
            height: L.h,
            backgroundImage: `url(${asset(`/img/nuvem/nuvem-jvbsbr-${L.arq}.webp`)})`,
            backgroundSize: `${COLUNAS * L.w}px ${4 * L.h}px`,
            backgroundPosition: "0 0",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}

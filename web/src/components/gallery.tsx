"use client";

import { useEffect, useRef, useState } from "react";
import { useLightbox } from "@/store/lightbox";
import { type GaleriaItem } from "@/config/galeria";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type Mode = "fit" | "natural";

const control =
  "inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-edge bg-surface px-4 py-2 font-display text-base font-semibold text-text hover:bg-raised disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-muted-foreground disabled:shadow-none";
const controlOn = "border-brand bg-brand text-bg hover:bg-brand";

// Imagem do diálogo. Reserva a área enquanto carrega e, se falhar, mostra "Imagem indisponível" com "Tentar novamente".
// O pai remonta este bloco a cada troca de imagem (key), o que zera carregamento, erro e tentativas.
function LightboxImage({ item, mode }: { item: GaleriaItem; mode: Mode }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  const src = retry === 0 ? item.src : `${item.src}?tentativa=${retry}`;

  if (state === "error") {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-display text-lg font-semibold">Imagem indisponível</p>
        <button
          type="button"
          className={control}
          onClick={() => {
            setState("loading");
            setRetry((n) => n + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <img
      key={retry}
      src={src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      onLoad={() => setState("ready")}
      onError={() => setState("error")}
      // Ajustar: imagem inteira dentro da área, sem passar do tamanho natural. Tamanho natural: dimensões do arquivo, com rolagem.
      style={
        mode === "natural"
          ? { width: item.width, height: item.height, maxWidth: "none" }
          : { maxWidth: `min(100%, ${item.width}px)`, maxHeight: `min(calc(100dvh - 19rem), ${item.height}px)`, width: "auto", height: "auto" }
      }
      className={cn("block bg-bg", mode === "fit" && "mx-auto", state === "loading" && "min-h-40")}
    />
  );
}

// Grade de prévias com zoom. O <dialog> nativo dá foco preso e fechamento com Esc.
export function Gallery({ items }: { items: GaleriaItem[] }) {
  const index = useLightbox((s) => s.index);
  const open = useLightbox((s) => s.open);
  const close = useLightbox((s) => s.close);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<Mode>("fit");
  const [rolavel, setRolavel] = useState(false);

  // A região só vira focável e rolável quando há o que rolar (senão as setas trocam de imagem).
  useEffect(() => {
    const region = regionRef.current;
    if (!region || mode !== "natural") {
      setRolavel(false);
      return;
    }
    const medir = () => setRolavel(region.scrollWidth > region.clientWidth + 1 || region.scrollHeight > region.clientHeight + 1);
    const ro = new ResizeObserver(medir);
    ro.observe(region);
    region.querySelectorAll("img").forEach((i) => i.addEventListener("load", medir));
    const t = window.setTimeout(medir, 100);
    medir();
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [mode, index]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  // Com a lightbox aberta, a página não rola por trás (§9.8).
  useEffect(() => {
    if (index === null) return;
    const root = document.documentElement;
    const antes = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = antes;
    };
  }, [index]);

  const current = index !== null ? items[index] : null;
  const last = items.length - 1;

  // Sem circular: nas extremidades o controle correspondente fica desabilitado.
  const go = (to: number) => {
    if (to < 0 || to > last) return;
    setMode("fit");
    open(to);
    // O botão que acabou de ser desabilitado perderia o foco: passa para o outro, ou para "Fechar imagem".
    requestAnimationFrame(() => {
      const el = document.activeElement;
      if (el === document.body || (el instanceof HTMLButtonElement && el.disabled)) {
        (to === 0 ? nextRef.current : to === last ? prevRef.current : closeRef.current)?.focus();
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (index === null || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    // Na região rolável em tamanho natural, as setas continuam rolando a imagem (se houver o que rolar).
    const region = regionRef.current;
    if (mode === "natural" && rolavel && region?.contains(document.activeElement)) return;
    e.preventDefault();
    go(e.key === "ArrowRight" ? index + 1 : index - 1);
  };

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2 nav:grid-cols-3 nav:gap-6">
        {items.map((item, i) => (
          <li key={item.src} className="min-w-0 rounded-xl border border-edge bg-surface shadow-block-card">
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Ampliar imagem: ${item.caption}`}
              className="group block aspect-[4/3] w-full bg-bg"
            >
              <img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" className="h-full w-full object-contain" />
            </button>
            <div className="grid gap-2 border-t border-edge p-4">
              <StatusBadge status="preview" />
              <span className="text-sm text-muted-foreground">{item.caption}</span>
              {/* Sem JavaScript, o acesso ao arquivo original continua disponível. */}
              <a href={item.src} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center text-sm text-brand underline underline-offset-4">
                Abrir imagem original
                <span className="sr-only">: {item.caption} (abre em uma nova aba)</span>
              </a>
            </div>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          // Só o clique fora do painel fecha; clicar na imagem ou no painel não fecha.
          const dialog = dialogRef.current;
          if (!dialog || e.target !== dialog) return;
          const r = dialog.getBoundingClientRect();
          const fora = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          if (fora) close();
        }}
        aria-label={current ? `Imagem ampliada: ${current.caption}` : "Imagem ampliada"}
        className="m-auto max-h-[96dvh] w-[min(96vw,64rem)] max-w-none overflow-hidden rounded-xl border-2 border-brand bg-surface p-0 text-text backdrop:bg-black/85"
      >
        {current && index !== null && (
          <div className="flex max-h-[96dvh] flex-col">
            <p role="status" className="sr-only">
              Imagem {index + 1} de {items.length}. {current.caption} Use as setas para trocar e Esc para fechar.
            </p>

            <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-edge p-4">
              <div className="grid min-w-0 gap-2">
                <h2 className="text-xl [overflow-wrap:anywhere]">{current.caption}</h2>
                <StatusBadge status="preview" />
                <span aria-hidden="true" className="text-sm text-muted-foreground">
                  Imagem {index + 1} de {items.length}
                </span>
              </div>
              <button ref={closeRef} type="button" onClick={close} aria-label="Fechar imagem" className={control}>
                Fechar
              </button>
            </div>

            <div role="group" aria-label="Tamanho da imagem" className="flex shrink-0 flex-wrap gap-2 border-b border-edge p-3">
              <button type="button" aria-pressed={mode === "fit"} onClick={() => setMode("fit")} className={cn(control, mode === "fit" && controlOn)}>
                Ajustar à tela
              </button>
              <button type="button" aria-pressed={mode === "natural"} onClick={() => setMode("natural")} className={cn(control, mode === "natural" && controlOn)}>
                Tamanho natural
              </button>
              <a href={current.src} target="_blank" rel="noopener noreferrer" className={cn(control, "text-brand")}>
                Abrir imagem original
                <span className="sr-only"> (abre em uma nova aba)</span>
              </a>
            </div>

            {/* Região rolável nos dois eixos, acessível por teclado; cabeçalho e controles ficam fora dela.
                A moldura externa dá folga para as duas faixas do foco não serem cortadas pelo diálogo. */}
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div
                ref={regionRef}
                tabIndex={mode === "natural" && rolavel ? 0 : undefined}
                role={mode === "natural" && rolavel ? "region" : undefined}
                aria-label={mode === "natural" && rolavel ? "Imagem em tamanho natural. Use as setas para rolar." : undefined}
                className="min-h-0 flex-1 overflow-auto bg-bg p-2"
              >
                <LightboxImage key={current.src} item={current} mode={mode} />
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-edge p-3">
              <button ref={prevRef} type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Imagem anterior" className={control}>
                Anterior
              </button>
              <button ref={nextRef} type="button" onClick={() => go(index + 1)} disabled={index === last} aria-label="Próxima imagem" className={control}>
                Próxima
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

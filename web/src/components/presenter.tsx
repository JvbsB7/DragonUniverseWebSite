import type { ReactNode } from "react";
import { SkinViewer } from "@/components/skin-viewer/skin-viewer";
import type { SkinAnimation } from "@/store/skin-viewer";
import { cn } from "@/lib/utils";

// Personagem da equipe com balão de fala (v2-04-design.md §9.5). O personagem é arte decorativa, sem moldura de visualizador.
// Celular: balão em cima e personagem embaixo. A partir de 768 px: personagem à esquerda e balão ao lado.
// `narrow` mantém o balão em cima mesmo em telas largas (coluna estreita do grid de duas colunas).
export function Presenter({
  src,
  alt,
  name,
  handle,
  animation = "idle",
  narrow = false,
  className,
  children,
}: {
  src: string;
  alt: string;
  name: string;
  handle: string;
  animation?: SkinAnimation;
  narrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 items-end gap-5 md:grid-cols-[8rem_minmax(0,1fr)]",
        narrow && "nav:grid-cols-1",
        className,
      )}
    >
      <blockquote
        className={cn(
          "relative min-w-0 rounded-xl bg-text p-5 text-bg shadow-block-card md:order-2 md:p-6",
          // Cauda quadrada decorativa: embaixo, à esquerda, quando o personagem fica abaixo; à esquerda do balão quando fica ao lado.
          "after:pointer-events-none after:absolute after:size-4 after:rotate-45 after:bg-text after:content-['']",
          "after:-bottom-[0.65rem] after:left-7  ",
          "md:after:-left-[0.65rem] md:after:bottom-6  ",
          narrow &&
            "nav:order-none nav:after:-bottom-[0.65rem] nav:after:left-7  ",
        )}
      >
        <p>
          <span className="sr-only">{name} diz: </span>
          {children}
        </p>
        <footer className="mt-4 text-sm font-semibold">
          <cite className="not-italic">
            {name} · {handle}
          </cite>
        </footer>
      </blockquote>
      <SkinViewer
        skin={src}
        alt={alt}
        animation={animation}
        className={cn("h-56 w-32 shrink-0 md:order-1", narrow && "nav:order-none")}
      />
    </div>
  );
}

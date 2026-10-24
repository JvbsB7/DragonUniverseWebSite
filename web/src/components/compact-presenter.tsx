import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Apresentador lateral compacto (entregas/v2-04-design/apresentadores-v2-5.md): personagem à esquerda, balão à direita,
// bases alinhadas (em wrap-reverse o eixo cruzado é invertido, por isso items-start), cauda quadrada decorativa apontando para o personagem. Com texto ampliado e pouco espaço,
// `flex-wrap-reverse` coloca o balão acima e o personagem abaixo, sem truncar nem reduzir a fonte.
// `figure` recebe a arte (imagem estática ou skin 3D decorativa); o texto e a identificação ficam sempre em HTML.
export function CompactPresenter({
  figure,
  name,
  handle,
  figureClassName,
  className,
  children,
}: {
  figure: ReactNode;
  name: string;
  handle: string;
  /** Área do personagem, em rem (celular e desktop). */
  figureClassName: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-wrap-reverse items-start gap-3 md:gap-6", className)}>
      <div aria-hidden="true" className={cn("shrink-0", figureClassName)}>
        {figure}
      </div>
      <blockquote
        className={cn(
          "relative min-w-0 flex-[1_1_14rem] border-2 border-bg bg-text p-4 text-bg shadow-[4px_4px_0_var(--du-shadow)] md:p-6",
          "after:pointer-events-none after:absolute after:-left-[0.65rem] after:bottom-5 after:size-4 after:rotate-45 after:border-b-2 after:border-l-2 after:border-bg after:bg-text after:content-['']",
        )}
      >
        <p className="text-[1.0625rem] leading-[1.6875rem] md:text-[1.125rem] md:leading-[1.8125rem]">
          <span className="sr-only">{name} diz: </span>
          {children}
        </p>
        <footer className="mt-3 text-sm font-semibold">
          <cite className="not-italic">
            {name} · {handle}
          </cite>
        </footer>
      </blockquote>
    </div>
  );
}

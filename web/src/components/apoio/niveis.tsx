import { Check, Crown, Shield, Zap } from "lucide-react";
import { SoonButton } from "@/components/button";
import { niveis, type Nivel } from "@/config/plans";
import { cn } from "@/lib/utils";

// Cards dos três níveis (v3-04-design.md §7.5 e §10): corpo opaco, preço legível, benefícios em texto e controle indisponível.
// A identidade de cada nível vem de faixa, ícone e luz (nunca só da cor: o nome está em texto). "Destaque" é rótulo
// editorial, não dado de assinantes. Sem hover que pareça ativar a contratação.
const visual: Record<Nivel["id"], { icone: typeof Shield; faixa: string; sombra: string; moldura: string }> = {
  guerreiro: { icone: Shield, faixa: "bg-primary", sombra: "shadow-[0_8px_24px_rgba(0,0,0,0.24),0_0_32px_var(--du-glow-primary)]", moldura: "border-edge" },
  "super-guerreiro": { icone: Zap, faixa: "bg-gold", sombra: "shadow-[0_14px_32px_rgba(0,0,0,0.3),0_0_40px_var(--du-glow-gold)]", moldura: "border-2 border-gold" },
  lendario: { icone: Crown, faixa: "bg-violet", sombra: "shadow-[0_8px_24px_rgba(0,0,0,0.24),0_0_32px_var(--du-glow-violet)]", moldura: "border-edge" },
};

export function Niveis() {
  return (
    <ul className="grid gap-6 nav:grid-cols-3 nav:items-stretch">
      {niveis.map((n) => {
        const v = visual[n.id];
        const Icone = v.icone;
        return (
          <li key={n.id} className="min-w-0">
            <article
              aria-labelledby={`nivel-${n.id}`}
              className={cn("relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border bg-surface p-5 pt-7 md:p-6 md:pt-8", v.moldura, v.sombra, n.destaque && "nav:-my-2 nav:py-8")}
            >
              <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-2", v.faixa)} />
              {n.id === "lendario" && <span aria-hidden="true" className="absolute inset-x-0 top-2 h-0.5 bg-gold" />}
              <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden="true" className={cn("grid size-11 shrink-0 place-items-center rounded-md text-bg", v.faixa)}>
                  <Icone className="size-6" />
                </span>
                <h3 id={`nivel-${n.id}`} className="text-2xl [overflow-wrap:anywhere]">{n.nome}</h3>
                {n.destaque && (
                  <span aria-label="Nível em destaque" className="rounded-sm bg-gold px-2 py-1 font-game text-sm font-semibold text-bg">
                    Destaque
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{n.tema}</p>
              <div className="grid gap-1">
                <p className="font-game text-4xl leading-[1.2] font-semibold md:text-[2.5rem]">{n.preco}</p>
                <p className="text-sm text-muted-foreground">Valor mensal. Ainda não cobrado.</p>
              </div>
              <div className="grid gap-2">
                {n.inclui && <p className="font-semibold">{n.inclui}</p>}
                <ul className="grid gap-2">
                  {n.beneficios.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
                      <span className="min-w-0">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-2">
                <SoonButton
                  label={`Apoiar como ${n.nome}`}
                  ariaLabel={`Apoiar como ${n.nome}: indisponível, em breve`}
                  note="Em breve. Nenhuma cobrança é feita agora."
                  className="w-full"
                />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

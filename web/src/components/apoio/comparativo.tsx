import { Expandable } from "@/components/expandable";
import { comparativo, niveis } from "@/config/plans";

const Valor = ({ ok }: { ok: boolean }) => (
  <span>
    <span aria-hidden="true" className={ok ? "text-brand" : "text-muted-foreground"}>{ok ? "✓" : "–"}</span> {ok ? "Incluído" : "Não incluído"}
  </span>
);

// Comparativo dos níveis (v3-04-design.md §10.3; copy §9.5): tabela semântica a partir de 768 px e um card por nível no
// celular, ambos da mesma fonte de dados (config/plans.ts). Valores em TEXTO (ícone só acompanha), sem rolagem horizontal.
// Só uma das representações fica exposta à árvore de acessibilidade (a outra está com display:none).
export function Comparativo() {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse overflow-hidden rounded-xl border border-edge text-start">
          <caption className="pb-3 text-start text-sm text-muted-foreground">
            Comparação dos benefícios de apoio por nível. Todos os benefícios são da comunidade e não valem dentro do jogo.
          </caption>
          <thead>
            <tr className="bg-raised">
              <th scope="col" className="w-[40%] p-3 text-start font-display">Benefício</th>
              {niveis.map((n) => (
                <th key={n.id} scope="col" className="p-3 text-start font-display">{n.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparativo.map((l, i) => (
              <tr key={l.beneficio} className={i % 2 ? "bg-raised" : "bg-surface"}>
                <th scope="row" className="p-3 text-start font-normal">{l.beneficio}</th>
                {l.valores.map((ok, j) => (
                  <td key={niveis[j].id} className="p-3">
                    <Valor ok={ok} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        <p className="text-sm text-muted-foreground">
          Comparação dos benefícios de apoio por nível. Todos os benefícios são da comunidade e não valem dentro do jogo.
        </p>
        {niveis.map((n, j) => {
          const dentro = comparativo.filter((l) => l.valores[j]);
          const fora = comparativo.filter((l) => !l.valores[j]);
          return (
            <section key={n.id} aria-labelledby={`cmp-${n.id}`} className="grid gap-3 rounded-xl border border-edge bg-surface p-5">
              <h3 id={`cmp-${n.id}`} className="text-xl">
                {n.nome} <span className="font-game text-base font-semibold text-muted-foreground">· {n.preco}</span>
              </h3>
              <ul className="grid gap-2">
                {dentro.map((l) => (
                  <li key={l.beneficio} className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">{l.beneficio}</span>
                    <Valor ok />
                  </li>
                ))}
              </ul>
              {fora.length > 0 && (
                <Expandable rotulo="Ver o que não está incluso" rotuloAberto="Ocultar">
                  <ul className="grid gap-2 pt-1">
                    {fora.map((l) => (
                      <li key={l.beneficio} className="flex flex-wrap items-start justify-between gap-2">
                        <span className="min-w-0">{l.beneficio}</span>
                        <Valor ok={false} />
                      </li>
                    ))}
                  </ul>
                </Expandable>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

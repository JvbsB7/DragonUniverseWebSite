import Link from "next/link";
import { RaceCard } from "@/components/race-card";
import { StatusBadge } from "@/components/status-badge";
import { LinkButton } from "@/components/button";
import { links } from "@/config/links";
import { habilidadesMoro, racasEmDesenvolvimento, racasNoJogo, racasPlanejadas, textoTestes } from "@/config/racas";

// Página de raças v3 (v3-04-design.md §9.2, design r1 §2; copy v3 §3, §5 e A.5): 6 raças já no jogo, "Raças em
// Desenvolvimento" (Glind, Cerealianos e a nova raça estilo Moro, sempre com texto, status e fundo opacos) e as planejadas.
// Os filtros não apagam a distinção entre grupos. Nada aqui liga raças a níveis de apoio.
export function RacasVitrine() {
  return (
    <div className="flex flex-col gap-12">
      <p className="max-w-[65ch] rounded-xl border border-edge bg-surface p-4">
        <strong>6 raças já no jogo.</strong> Outras estão em desenvolvimento e ainda não estão liberadas para jogar.
      </p>

      <section aria-labelledby="racas-no-jogo" className="flex flex-col gap-4">
        <h2 id="racas-no-jogo">6 raças já no jogo</h2>
        <p className="text-sm text-muted-foreground">Versão de teste: o add-on ainda não tem versão pública.</p>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
          {racasNoJogo.map((r) => (
            <li key={r.slug} className="min-w-0">
              <RaceCard raca={r} />
            </li>
          ))}
        </ul>
      </section>

      <section id="em-desenvolvimento" aria-labelledby="racas-dev" className="flex scroll-mt-4 flex-col gap-4">
        <h2 id="racas-dev">Raças em Desenvolvimento</h2>
        <p className="max-w-[65ch] text-muted-foreground">Aqui estão as raças e os conteúdos que a equipe ainda está construindo. Nenhum deles está liberado para jogar.</p>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
          {racasEmDesenvolvimento.map((r) => (
            <li key={r.slug} className="min-w-0">
              <RaceCard raca={r} />
            </li>
          ))}
        </ul>

        <article className="mt-4 grid gap-3 rounded-xl border border-dashed border-border bg-surface p-5 md:p-6">
          <StatusBadge status="dev" />
          <h3 className="text-card-title">{habilidadesMoro.nome}</h3>
          <p className="max-w-[65ch] text-muted-foreground">{habilidadesMoro.descricao}</p>
          <div className="grid gap-1">
            <h4 className="font-game text-sm font-semibold">O que a equipe quer construir</h4>
            <p className="text-sm text-muted-foreground">(pode mudar durante o desenvolvimento)</p>
            <ul className="list-disc ps-5 text-muted-foreground">
              {habilidadesMoro.direcao.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <Link href={habilidadesMoro.href} aria-label={`Ver detalhes de ${habilidadesMoro.nome}`} className="inline-flex min-h-12 items-center font-semibold text-brand underline underline-offset-4">
              Ver detalhes
            </Link>
          </div>
        </article>

        <div className="mt-4 grid gap-3 rounded-xl border border-edge bg-surface p-5 md:p-6">
          <h3>{textoTestes.titulo}</h3>
          <p className="max-w-[65ch]">
            <strong>{textoTestes.p1}</strong> {textoTestes.p2}
          </p>
          <p className="max-w-[65ch]">Quando o conteúdo estiver pronto, o <strong>lançamento completo será gratuito</strong>.</p>
          <p role="note" className="max-w-[65ch] text-sm text-muted-foreground">{textoTestes.aviso}</p>
          <div>
            <LinkButton href={links.discord} variant="primary" external>
              Avisar-me no Discord
            </LinkButton>
          </div>
        </div>
      </section>

      <section aria-labelledby="racas-planejadas" className="flex flex-col gap-4">
        <h2 id="racas-planejadas">Planejado</h2>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
          {racasPlanejadas.map((r) => (
            <li key={r.slug} className="min-w-0">
              <RaceCard raca={r} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

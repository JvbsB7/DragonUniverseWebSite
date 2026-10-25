import { LinkButton } from "@/components/button";
import { links } from "@/config/links";

// Comunidade (copy v3 §11.1 e A.4): texto e quatro pontos exatos, sem número de membros nem "comunidade ativa".
const pontos = [
  ["Notícias do projeto", "Novidades do desenvolvimento, direto da equipe."],
  ["Participação", "Converse com a equipe e com outros jogadores."],
  ["Apoiadores", "Informações sobre como apoiar o projeto, quando os planos abrirem."],
  ["Testes", "Avisos sobre testes fechados, quando houver."],
] as const;

export function Community({ headingId = "comunidade" }: { headingId?: string }) {
  return (
    <div className="grid gap-8 rounded-xl border border-edge bg-surface p-6 shadow-block-card md:p-8 nav:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] nav:gap-10">
      <div className="grid content-start gap-4">
        <h2 id={headingId}>Faça parte da comunidade</h2>
        <p className="max-w-[65ch]">
          O Discord do Dragon Universe é onde a equipe conversa com a comunidade, mostra o que está construindo e avisa das novidades. Entre para acompanhar o projeto de perto.
        </p>
        <div className="flex flex-wrap gap-4">
          <LinkButton href={links.discord} variant="primary" external>
            Entrar no Discord
          </LinkButton>
          <LinkButton href={links.github} external>
            Ver no GitHub
          </LinkButton>
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        {pontos.map(([t, d]) => (
          <div key={t} className="min-w-0 border-s-4 border-brand ps-4">
            <dt className="font-display text-lg font-semibold">{t}</dt>
            <dd className="text-muted-foreground">{d}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

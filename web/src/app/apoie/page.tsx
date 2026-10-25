import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { LinkButton } from "@/components/button";
import { EnergyStrip } from "@/components/decor";
import { Presenter } from "@/components/presenter";
import { StatusBadge } from "@/components/status-badge";
import { links } from "@/config/links";
import { plans } from "@/config/plans";

export const metadata: Metadata = pageMetadata({
  title: "Apoie o projeto | Dragon Universe",
  description: "O Dragon Universe é gratuito. Veja por que o apoio existe e o que ele vai ajudar a financiar. Planos opcionais em breve.",
  path: "/apoie",
});

const painel = "rounded-xl border border-edge bg-surface p-6 shadow-block-card";

export default function ApoiePage() {
  const { plansApproved, tiers } = plans;
  // Com os planos aprovados e um link de apoio, o apoio vira o CTA primário e o Discord passa a secundário.
  const supportUrl = plansApproved ? links.support : null;
  const mostrarTiers = plansApproved && tiers.length > 0;

  return (
    <div className="du-container flex flex-col gap-12 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <div>
          <StatusBadge status="soon" />
        </div>
        <h1>Apoie o projeto</h1>
      </header>

      <section aria-labelledby="gratuito" className={painel}>
        <h2 id="gratuito">O add-on continua gratuito</h2>
        <p className="mt-3 max-w-[65ch]">
          <strong>O Dragon Universe é gratuito e continua gratuito.</strong> Apoiar é opcional. Você não precisa de nada disso para jogar.
        </p>
      </section>

      <section aria-labelledby="por-que" className="flex flex-col gap-3">
        <h2 id="por-que">Por que o apoio existe</h2>
        <p className="max-w-[65ch] text-muted-foreground">
          O Dragon Universe é feito por fãs. Manter e ampliar um add-on dá trabalho: corrigir falhas, testar versões e construir lugares novos. O apoio existe para quem quiser ajudar esse trabalho a continuar.
        </p>
      </section>

      <Presenter src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, falando sobre o apoio.">
        Quando tivermos novidades sobre como ajudar, a gente avisa no Discord.
      </Presenter>

      <section aria-labelledby="financiar" className="flex flex-col gap-4">
        <h2 id="financiar">O que o apoio vai ajudar a financiar</h2>
        <p className="max-w-[65ch] text-muted-foreground">O que o time já tem pela frente (sem data e sem promessa):</p>
        <ul className="grid gap-4 md:grid-cols-2">
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Estabilidade:</strong> proteção do progresso salvo, Esferas do Dragão e desejos corrigidos e um voo reformulado.</li>
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Novos treinos e novas raças e formas.</strong></li>
          <li className="rounded-xl border border-edge bg-surface p-5">
            <strong>Novos lugares e construções</strong>, como as que estão em{" "}
            <Link href="/roadmap" className="text-brand underline underline-offset-4">Em desenvolvimento</Link>.
          </li>
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Eventos dinâmicos e um mundo mais vivo.</strong></li>
        </ul>
      </section>

      {/* Leitura principal em sete colunas e card único em cinco, sem posicionamento sticky (§8.4). */}
      <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] nav:gap-12">
        <section aria-labelledby="como" className="flex min-w-0 flex-col gap-3">
          <h2 id="como">Como vai funcionar</h2>
          <p className="max-w-[65ch]">
            <strong>Ainda não há planos abertos, valores nem forma de pagamento.</strong> Nenhuma cobrança está aberta. Quando o time definir tudo, a novidade será anunciada no Discord.
          </p>
        </section>

        {!mostrarTiers && (
          // Um único card informativo, sem botão, preço, nível ou checkout (copy v2.1 §9, design §9.6).
          <article aria-label="Apoio: em breve, sem valores definidos" className="min-w-0 rounded-xl border border-dashed border-border bg-surface">
            <EnergyStrip variant="brand" className="h-12 border-b-2 border-bg" />
            <div className="flex flex-col items-start gap-3 p-5 md:p-6">
              <h2 className="text-2xl">Planos de apoio</h2>
              <StatusBadge status="soon" />
              <p className="text-sm text-muted-foreground">Sem valores definidos.</p>
            </div>
          </article>
        )}
      </div>

      {mostrarTiers && (
        <ul className="grid gap-4 md:grid-cols-2 nav:grid-cols-3">
          {tiers.map((tier) => (
            <li key={tier.name} className="flex flex-col gap-3 border-2 border-brand bg-surface p-5">
              <h2 className="text-xl">{tier.name}</h2>
              <p className="font-display text-2xl text-action">{tier.price}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {tier.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="mt-auto">
                <LinkButton href={tier.url} variant="primary" external>Apoiar</LinkButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="cta" className="flex flex-col gap-4 rounded-xl border border-edge border-s-4 border-s-brand bg-surface p-6">
        <h2 id="cta">Quer ser avisado quando houver novidade?</h2>
        <p className="text-muted-foreground">Entre na comunidade.</p>
        <div className="flex flex-wrap gap-4">
          {supportUrl && (
            <LinkButton href={supportUrl} variant="primary" external>
              Apoiar o projeto
            </LinkButton>
          )}
          <LinkButton href={links.discord} variant={supportUrl ? "secondary" : "primary"} external>
            {supportUrl ? "Entrar no Discord" : "Quero ser avisado dos planos"}
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LinkButton } from "@/components/button";
import { Presenter } from "@/components/presenter";
import { StatusBadge } from "@/components/status-badge";
import { Niveis } from "@/components/apoio/niveis";
import { Comparativo } from "@/components/apoio/comparativo";
import Link from "next/link";
import { links } from "@/config/links";
import { perguntas } from "@/config/plans";

export const metadata: Metadata = pageMetadata({
  title: "Apoie o Dragon Universe",
  description: "Conheça os níveis de apoio: Guerreiro, Super Guerreiro e Lendário. Em breve. O add-on continua gratuito e nada vale dentro do jogo.",
  path: "/apoie",
});

// Página de apoio v3 (copy v3 §9 e A.9, ordem fixa): os três avisos ficam ACIMA dos planos. Nada aqui simula assinatura:
// sem formulário, login, carrinho nem confirmação; a única ação ativa é entrar no Discord. Benefícios só de comunidade.
export default function ApoiePage() {
  return (
    <div className="du-container flex flex-col gap-14 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <div>
          <StatusBadge status="soon" />
        </div>
        <h1>Apoie o Dragon Universe</h1>
        <p className="max-w-[65ch] text-lg text-muted-foreground">
          Quem apoia ajuda a manter o projeto andando e fica mais perto da comunidade. Os apoios ainda não estão abertos.
        </p>
        <div role="note" aria-label="Avisos sobre o apoio" className="grid max-w-[65ch] gap-3 rounded-xl border-2 border-gold bg-alert-bg p-5 text-alert-fg">
          <p>
            <strong>O add-on do Dragon Universe é gratuito e continua gratuito.</strong> Apoiar é opcional e você não precisa apoiar para jogar.
          </p>
          <p>
            <strong>Nenhum benefício de apoio é dentro do jogo.</strong> Os benefícios valem para a comunidade: Discord, novidades do desenvolvimento e reconhecimento.
          </p>
          <p>
            <strong>Os apoios ainda não estão abertos.</strong> Os botões abaixo estão desativados e nenhuma cobrança é feita.
          </p>
        </div>
      </header>

      <section aria-labelledby="por-que" className="flex flex-col gap-3">
        <h2 id="por-que" className="text-2xl">Por que o apoio existe</h2>
        <p className="max-w-[65ch] text-muted-foreground">
          O Dragon Universe é feito por fãs. Manter e ampliar um add-on dá trabalho: corrigir falhas, testar versões e construir lugares novos. O apoio existe para quem quiser ajudar esse trabalho a continuar.
        </p>
      </section>

      <Presenter src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, falando sobre o apoio.">
        Quando tivermos novidades sobre como ajudar, a gente avisa no Discord.
      </Presenter>

      <section aria-labelledby="escolha" className="flex flex-col gap-6">
        <div className="grid gap-2">
          <h2 id="escolha">Escolha como apoiar</h2>
          <p className="text-muted-foreground">Três níveis mensais. Cada nível inclui tudo do anterior.</p>
        </div>
        <Niveis />
      </section>

      <section aria-labelledby="compare" className="cv-auto flex flex-col gap-6">
        <div className="grid gap-2">
          <h2 id="compare">Compare os níveis</h2>
          <p className="text-muted-foreground">Benefícios previstos para quando os planos abrirem.</p>
        </div>
        <Comparativo />
        <div className="grid max-w-[65ch] gap-2 text-sm text-muted-foreground">
          <p>Relatórios, sessões com a equipe e perguntas e respostas acontecem <strong className="text-text">quando a equipe agendar, no Discord</strong>. O conteúdo de bastidores fica em um <strong className="text-text">chat exclusivo no Discord</strong>. Não há frequência prometida.</p>
          <p>Aparecer nos créditos é <strong className="text-text">opcional</strong>: você escolhe.</p>
        </div>
      </section>

      <section aria-labelledby="financiar" className="cv-auto flex flex-col gap-4">
        <h2 id="financiar">O que o apoio vai ajudar a financiar</h2>
        <p className="max-w-[65ch] text-muted-foreground">O que o time já tem pela frente (sem data e sem promessa):</p>
        <ul className="grid gap-4 md:grid-cols-2">
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Estabilidade:</strong> proteção do progresso salvo, Esferas do Dragão e desejos corrigidos e um voo reformulado.</li>
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Novos treinos, novas raças e formas.</strong></li>
          <li className="rounded-xl border border-edge bg-surface p-5">
            <strong>Novos lugares e construções</strong>, como as que estão em{" "}
            <Link href="/roadmap" className="du-text-link">Em desenvolvimento</Link>.
          </li>
          <li className="rounded-xl border border-edge bg-surface p-5"><strong>Eventos dinâmicos e um mundo mais vivo.</strong></li>
        </ul>
        <p role="note" className="max-w-[65ch] rounded-xl border border-edge bg-surface p-4">
          O apoio <strong>não libera nada dentro do jogo</strong>: nenhuma raça, roupa, equipamento, transformação ou habilidade.
        </p>
      </section>

      <section aria-labelledby="perguntas" className="cv-auto flex flex-col gap-4">
        <h2 id="perguntas">Perguntas frequentes sobre o apoio</h2>
        <div className="grid gap-3">
          {perguntas.map((q) => (
            <details key={q.p} className="group rounded-xl border border-edge bg-surface p-4 open:border-brand">
              <summary className="flex min-h-12 cursor-pointer items-center font-display text-lg font-semibold">{q.p}</summary>
              <p className="mt-2 max-w-[65ch] text-muted-foreground">{q.r}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta" className="cv-auto grid gap-4 rounded-xl border border-edge border-s-4 border-s-brand bg-surface p-6 md:p-8">
        <h2 id="cta" className="text-2xl">Quer ser avisado quando os planos abrirem?</h2>
        <p className="text-muted-foreground">Entre na comunidade.</p>
        <div>
          <LinkButton href={links.discord} variant="primary" external>Quero ser avisado dos planos</LinkButton>
        </div>
      </section>

      <p className="max-w-[65ch] text-sm text-muted-foreground">
        Dragon Ball é propriedade de Akira Toriyama, Shueisha e Toei Animation. Minecraft é marca da Mojang/Microsoft. Projeto de fãs, sem vínculo oficial. O apoio ajuda a manter a comunidade e o desenvolvimento do projeto; não compra personagens, formas, roupas ou habilidades de Dragon Ball.
      </p>
    </div>
  );
}

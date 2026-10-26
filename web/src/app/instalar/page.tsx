import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LinkButton, SoonButton } from "@/components/button";
import { Presenter } from "@/components/presenter";
import { StatusBadge } from "@/components/status-badge";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Como instalar | Dragon Universe",
  description: "Requisitos do Dragon Universe: Minecraft Bedrock 26.52, experimentos Beta APIs e Próximos recursos do criador ativados e backup do mundo. Download em breve.",
  path: "/instalar",
});

export default function InstalarPage() {
  return (
    <article className="du-container flex max-w-3xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <h1>Como instalar</h1>
        <div>
          <StatusBadge status="soon">Versão de teste</StatusBadge>
        </div>
        <Presenter src="/skins/jvbs.png" name="João Vitor" handle="@jvbs" animation="wave" alt="João Vitor, o @jvbs, com cabelo preto, olhos azuis e casaco preto, dando uma dica de instalação.">
          Antes de começar, uma dica de amigo: faça backup do seu mundo. A versão ainda está em teste.
        </Presenter>
      </header>

      <section aria-labelledby="aviso" className="rounded-lg border-2 border-action bg-alert-bg p-6">
        <h2 id="aviso">Versão de teste</h2>
        <p className="mt-2">
          A 1.7.1E ainda está em teste da equipe. <strong>Faça backup do seu mundo</strong> antes de qualquer coisa.
        </p>
      </section>

      <section id="requisitos" aria-labelledby="requisitos-titulo" className="flex flex-col gap-4">
        <h2 id="requisitos-titulo">Requisitos</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Minecraft Bedrock 26.52</strong></li>
          <li>Experimentos <strong>Beta APIs</strong> e <strong>Próximos recursos do criador</strong> ativados no mundo onde você vai jogar</li>
          <li><strong>PC e celular</strong> por enquanto. Console: sem confirmação.</li>
        </ul>
      </section>

      <section aria-labelledby="passos" className="flex flex-col gap-4">
        <h2 id="passos">Passos (PC e celular)</h2>
        <p>
          <strong>Download: Em breve.</strong> Ainda não existe versão pública. O passo a passo de instalação entra aqui quando houver o arquivo para baixar. Quando isso acontecer, o aviso sai no Discord.
        </p>
        <p>O que você já pode fazer agora:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Confira se o seu Minecraft Bedrock está na versão <strong>26.52</strong>.</li>
          <li>Saiba onde ativar os experimentos <strong>Beta APIs</strong> e <strong>Próximos recursos do criador</strong>.</li>
          <li>Entre no Discord para ser avisado.</li>
          <li>Faça <strong>backup dos seus mundos</strong>.</li>
        </ol>
      </section>

      <section aria-labelledby="problemas" className="flex flex-col gap-4">
        <h2 id="problemas">Solução de problemas</h2>
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="font-display font-semibold">Não consigo jogar com o add-on.</dt>
            <dd className="text-muted-foreground">Confira se o Minecraft Bedrock está na versão 26.52 e se os experimentos <strong className="text-text">Beta APIs</strong> e <strong className="text-text">Próximos recursos do criador</strong> estão ativados no mundo.</dd>
          </div>
          <div>
            <dt className="font-display font-semibold">Algo deu errado no meu mundo.</dt>
            <dd className="text-muted-foreground">É uma versão de teste. Volte ao seu backup e conte o que aconteceu no Discord.</dd>
          </div>
          <div>
            <dt className="font-display font-semibold">Outros problemas.</dt>
            <dd className="text-muted-foreground">Ainda não temos uma lista de problemas conhecidos. Conte o seu caso no Discord.</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="download" className="flex flex-col gap-4">
        <h2 id="download">Estado do download</h2>
        <p>
          <strong>Download: Em breve.</strong> O add-on é <strong>gratuito</strong>. Ainda não existe versão pública.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <SoonButton label="Baixar" note="Ainda não existe versão pública." />
          <LinkButton href={links.discord} variant="primary" external>
            Entrar no Discord
          </LinkButton>
        </div>
      </section>
    </article>
  );
}

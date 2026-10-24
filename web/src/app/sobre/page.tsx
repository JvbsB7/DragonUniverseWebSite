import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/button";
import { links } from "@/config/links";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "O projeto | Dragon Universe",
  description:
    "Conheça o Dragon Universe: add-on gratuito de fãs para Minecraft Bedrock, inspirado no Dragon Evolution, de About04. Versão 1.7.1E em teste.",
  path: "/sobre",
});

const link = "text-brand underline underline-offset-4";

export default function SobrePage() {
  return (
    <article className="du-container flex max-w-3xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <h1>O projeto</h1>
        <p className="text-lg text-muted-foreground">Um add-on de fãs que leva Dragon Ball ao Minecraft Bedrock.</p>
      </header>

      <section aria-labelledby="o-que-e" className="flex flex-col gap-4">
        <h2 id="o-que-e">O que é</h2>
        <p>
          O <strong>Dragon Universe</strong> é um add-on de fãs para Minecraft Bedrock. É feito pela equipe Dragon Universe, com <strong>nome e identidade próprios</strong>, e é <strong>inspirado no Dragon Evolution, de About04</strong>.
        </p>
        <p>O add-on é <strong>gratuito</strong>.</p>
        <p className="font-display text-xl font-semibold text-brand">Inspirado no Dragon Evolution, de About04.</p>
      </section>

      <section aria-labelledby="equipe-fez" className="flex flex-col gap-4">
        <h2 id="equipe-fez">O que a equipe fez</h2>
        <p>Desde a versão em que a equipe começou a trabalhar, o projeto ganhou:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Nova identidade:</strong> novo nome e novo logo azul.</li>
          <li><strong>Estruturas únicas por mundo:</strong> uma Casa do Kame, uma Casa do Goku, uma arena dos Jogos de Cell e uma nave do Babidi, além de até 3 Cidades do Oeste e 5 cidades.</li>
          <li><strong>Planetas sem mobs comuns do Minecraft.</strong></li>
          <li><strong>Voo mais suave</strong> e sons e HUD corrigidos.</li>
          <li><strong>Correções de história e de viagem entre planetas.</strong></li>
          <li><strong>Aldeões dos planetas redesenhados, Kaioken reequilibrado</strong> e mais.</li>
        </ul>
        <p>
          A lista completa está em <Link href="/novidades" className={link}>Novidades</Link>.
        </p>
      </section>

      <section aria-labelledby="versao" className="flex flex-col gap-4">
        <h2 id="versao">Versão atual</h2>
        <p>
          <strong>1.7.1E</strong>, em teste da equipe. <strong>Não existe versão pública estável.</strong> O download está <strong>Em breve</strong>.
        </p>
      </section>

      <section aria-labelledby="requisitos" className="flex flex-col gap-4 rounded-lg border-2 border-border bg-alert-bg p-6">
        <h2 id="requisitos">Requisitos</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Minecraft Bedrock 26.52</strong></li>
          <li>Experimento <strong>Beta APIs</strong> ativado no mundo</li>
          <li><strong>PC e celular</strong> (console: sem confirmação)</li>
          <li><strong>Faça backup do seu mundo.</strong> É uma versão de teste.</li>
        </ul>
        <p>
          Mais detalhes em <Link href="/instalar" className={link}>Como instalar</Link>.
        </p>
      </section>

      <section aria-labelledby="idiomas" className="flex flex-col gap-4">
        <h2 id="idiomas">Idiomas</h2>
        <p>No jogo: português, inglês e espanhol. O site é só em português.</p>
      </section>

      <section aria-labelledby="aviso" className="flex flex-col gap-4">
        <h2 id="aviso">Aviso de projeto de fãs</h2>
        <p className="text-muted-foreground">
          Dragon Ball é propriedade de Akira Toriyama, Shueisha e Toei Animation. Minecraft é marca da Mojang/Microsoft. Projeto de fãs, sem vínculo oficial.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
        <LinkButton href="/instalar">Como instalar</LinkButton>
        <LinkButton href={links.github} external>Ver no GitHub</LinkButton>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { LinkButton } from "@/components/button";
import { StatusBadge } from "@/components/status-badge";
import { Presenter } from "@/components/presenter";
import { TeamScene } from "@/components/team-scene/team-scene";
import { SectionHeading } from "@/components/decor";
import { RaceCard } from "@/components/race-card";
import { DestinoCard } from "@/components/destino-card";
import { ConteudoFuturo } from "@/components/conteudo-futuro";
import { Community } from "@/components/community";
import { HomeReveal } from "@/components/home-reveal";
import { HeroLogoBand } from "@/components/hero/hero-logo-band";
import { HeroParallax } from "@/components/hero/hero-parallax";
import { TransformacoesShowcase } from "@/components/showcase/transformacoes-showcase";
import { racasEmDesenvolvimento, racasNoJogo } from "@/config/racas";
import { destinos } from "@/config/universo";
import { galeria } from "@/config/galeria";
import { getTransformacoes } from "@/lib/transformacoes-data";
import { assetSet } from "@/lib/asset";

export const metadata: Metadata = pageMetadata({
  title: "Dragon Universe: seu universo, sua história, seu poder",
  description:
    "Add-on gratuito de fãs para Minecraft Bedrock: 6 raças já no jogo, transformações, ataques de ki e 47 missões. Versão de teste.",
  path: "/",
});

// Faixa de números (copy v3 A.4): só o que tem fonte na wiki ou na v2; as raças em desenvolvimento ficam em outro bloco.
const faixa = ["6 raças já no jogo", "Transformações", "Ataques de ki", "47 missões principais", "Viagem entre planetas"];

export default function HomePage() {
  const hero = galeria[0];
  const transformacoes = getTransformacoes();
  const destaques = destinos.filter((d) => d.destaque);
  return (
    <>
      <HomeReveal />
      <section aria-labelledby="titulo-home" className="pt-8 pb-16 md:pt-12 md:pb-20 nav:pb-24">
        <div className="du-container grid gap-8 nav:grid-cols-[minmax(0,5fr)_minmax(0,7.103fr)] nav:items-start nav:gap-6">
          <div className="min-w-0">
            <p className="mb-4 font-game text-sm font-semibold text-brand">Add-on gratuito feito por fãs · Versão de teste</p>
            {/* O H1 é texto puro e visível no primeiro quadro (sem animação de opacidade): é ele ou o pôster que fecha o LCP. */}
            <h1 id="titulo-home" className="mb-6 text-hero [overflow-wrap:anywhere]">
              <span className="block">SEU UNIVERSO.</span> <span className="block">SUA HISTÓRIA.</span> <span className="block text-brand">SEU PODER.</span>
            </h1>
            <p className="max-w-[48ch] text-lg">
              Explore o universo de Dragon Universe, um add-on para Minecraft Bedrock com raças, transformações, aventuras e um mundo em constante evolução.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 nav:grid-cols-1 min-[1180px]:grid-cols-2">
              <LinkButton href="#universo" variant="primary" size="lg">
                Explorar o Universo
              </LinkButton>
              <LinkButton href="/roadmap" size="lg">
                Acompanhar Desenvolvimento
              </LinkButton>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Inspirado no Dragon Evolution, de About04.</p>
          </div>

          {/* Área visual: cosmos CSS, logo (SVG; 3D só no desktop depois de interação), print inteiro do Planeta do Bills em
              camada própria e legenda fora da mídia, em superfície opaca. Pronta para trocar o print por um .glb do Ricardo. */}
          <div className="hero-in relative isolate min-w-0 overflow-hidden rounded-xl border border-edge bg-bg shadow-block-card">
            <div aria-hidden="true" className="hero-cosmos absolute inset-0 -z-10" />
            <div aria-hidden="true" className="stars-a absolute inset-0 -z-10" />
            <div aria-hidden="true" className="stars-b absolute inset-0 -z-10 hidden md:block" />
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="ki-particle"
                style={{ left: `${8 + ((i * 37) % 84)}%`, top: `${10 + ((i * 53) % 70)}%`, animationDelay: `${(i % 4) * 90}ms` }}
              />
            ))}
            <div className="px-4 pt-4 md:px-6 md:pt-6">
              <HeroLogoBand />
            </div>
            <HeroParallax className="px-4 pb-4 md:px-6 md:pb-6">
              <figure className="hero-depth-print mx-auto max-w-[20rem] md:max-w-none">
                <div className="overflow-hidden rounded-md border border-edge bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.src}
                    srcSet={assetSet("/img/planeta-do-bills-360.webp 360w, /img/planeta-do-bills-859.webp 859w")}
                    sizes="(min-width: 1100px) 640px, calc(100vw - 4rem)"
                    fetchPriority="high"
                    alt={hero.alt}
                    width={hero.width}
                    height={hero.height}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </figure>
            </HeroParallax>
            <div className="grid gap-2 border-t border-edge bg-surface p-4 text-sm md:p-5">
              <StatusBadge status="preview" />
              <p>
                <strong>Planeta do Bills.</strong> Ainda não está no add-on.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="o-que-e" className="bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="o-que-e">O que é o Dragon Universe</SectionHeading>
          <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] nav:gap-12">
            <div className="max-w-[65ch]">
              <p>
                O Dragon Universe é um <strong>add-on de fãs para Minecraft Bedrock</strong>. Foi criado pela equipe Dragon Universe, com <strong>nome e identidade próprios</strong>, e é <strong>inspirado no Dragon Evolution, de About04</strong>.
              </p>
              <p className="mt-4">
                A versão atual é a <strong>1.7.1E</strong>, em teste da equipe. Ainda não há versão pública estável. Por enquanto, funciona em <strong>PC e celular</strong>. O add-on é <strong>gratuito</strong>. No jogo, os idiomas são português, inglês e espanhol. O site é só em português.
              </p>
              <Link href="/sobre" className="mt-4 inline-flex min-h-12 items-center text-brand underline underline-offset-4">
                Saiba mais sobre o projeto
              </Link>
            </div>
            <Presenter narrow src="/skins/jvbs.png" name="João Vitor" handle="@jvbs" animation="wave" alt="João Vitor, o @jvbs, com cabelo preto, olhos azuis e casaco preto, apresentando a seção.">
              E aí! Eu sou o João (@jvbs). Aqui você vê o que o jogo já tem hoje.
            </Presenter>
          </div>
          <ul aria-label="O que tem na versão de teste" className="mt-8 flex flex-wrap gap-3">
            {faixa.map((t) => (
              <li key={t} className="rounded-md border border-edge bg-bg px-3 py-2 font-game text-sm font-semibold">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="racas" aria-labelledby="titulo-racas" className="py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="titulo-racas" lead="Cada raça tem bônus e transformações próprios. Veja as que já estão no jogo e as que a equipe ainda está construindo.">
            Raças
          </SectionHeading>
          <p className="mb-6 max-w-[65ch]">
            <strong>6 raças já no jogo.</strong> Outras estão em desenvolvimento e ainda não estão liberadas para jogar.
          </p>
          <h3 className="mb-4">6 raças já no jogo</h3>
          <p className="mb-4 text-sm text-muted-foreground">Versão de teste: o add-on ainda não tem versão pública.</p>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
            {racasNoJogo.map((r) => (
              <li key={r.slug} className="min-w-0">
                <RaceCard raca={r} />
              </li>
            ))}
          </ul>
          <h3 id="em-desenvolvimento" className="mt-12 mb-4">Raças em Desenvolvimento</h3>
          <p className="mb-4 max-w-[65ch] text-muted-foreground">Aqui estão as raças e os conteúdos que a equipe ainda está construindo. Nenhum deles está liberado para jogar.</p>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
            {racasEmDesenvolvimento.map((r) => (
              <li key={r.slug} className="min-w-0">
                <RaceCard raca={r} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <LinkButton href="/wiki/racas">Ver todas as raças</LinkButton>
          </div>
        </div>
      </section>

      <section id="transformacoes" aria-labelledby="titulo-transformacoes" className="bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="titulo-transformacoes" lead="Do Super Saiyajin ao Ultra Ego: veja as formas que já estão no jogo e as que a equipe ainda planeja.">
            Transformações
          </SectionHeading>
          <TransformacoesShowcase itens={transformacoes} />
          <div className="mt-8">
            <LinkButton href="/wiki/transformacoes">Ver todas as transformações</LinkButton>
          </div>
        </div>
      </section>

      <section id="universo" aria-labelledby="titulo-universo" className="py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="titulo-universo" lead="Planetas e dimensões do add-on. Escolha um destino para ver o que existe hoje e o que ainda está nos planos.">
            Explore o Universo
          </SectionHeading>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 nav:grid-cols-3">
            {destaques.map((d) => (
              <li key={d.slug} className="min-w-0">
                <DestinoCard d={d} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">Cada destino mostra o status. O que está em desenvolvimento ou planejado ainda não existe no add-on.</p>
          <div className="mt-6">
            <LinkButton href="/wiki/planetas-e-dimensoes">Ver todos os destinos</LinkButton>
          </div>
        </div>
      </section>

      <section aria-labelledby="desenvolvimento-teaser" className="cv-auto bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="desenvolvimento-teaser" lead="O que a equipe construiu, o que está construindo e o que vem pela frente. Sem datas, sem percentuais e sem promessa de entrega.">
            Em desenvolvimento e planejado
          </SectionHeading>
          <div className="grid items-start gap-10 nav:grid-cols-2 nav:gap-12">
            <div className="min-w-0">
              <h3 className="mb-3">Em desenvolvimento</h3>
              <p className="max-w-[65ch] text-muted-foreground">
                <strong className="text-text">Construções novas em desenvolvimento.</strong> Planeta do Bills, Torneio do Poder, Corporação Cápsula e outras. São prévias e <strong className="text-text">não estão no add-on</strong>.
              </p>
              <ul className="mt-6 grid gap-4 md:grid-cols-3 nav:grid-cols-1 min-[1180px]:grid-cols-3">
                {galeria.slice(1, 4).map((item) => (
                  <li key={item.src} className="min-w-0 overflow-hidden rounded-xl border border-edge bg-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" className="h-auto w-full" />
                    <div className="grid gap-2 border-t border-edge p-4">
                      <StatusBadge status="preview" />
                      <span className="text-sm text-muted-foreground">{item.caption}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <LinkButton href="/roadmap">Ver o que vem por aí</LinkButton>
                <LinkButton href="/galeria">Ver a galeria</LinkButton>
                <LinkButton href="/novidades">Ver as novidades</LinkButton>
              </div>
              <div className="mt-8">
                <Presenter narrow src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, apresentando a seção.">
                  Aqui é o Ricardo (@rvmm). Estas são prévias das minhas construções, ainda em andamento. Nenhuma está no add-on por enquanto.
                </Presenter>
              </div>
            </div>
            <div className="min-w-0">
              <ConteudoFuturo headingId="conteudo-futuro-home" nivel={3} compacto />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="equipe-teaser" className="cv-auto py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <SectionHeading id="equipe-teaser" lead="Três fãs, um add-on. Conheça João, Ricardo e Luan.">
            Quem faz o Dragon Universe
          </SectionHeading>
          <TeamScene />
          <div className="mt-6">
            <LinkButton href="/equipe">Conhecer a equipe</LinkButton>
          </div>
        </div>
      </section>

      <section aria-labelledby="comunidade" className="cv-auto bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <Community />
        </div>
      </section>

      <section aria-labelledby="apoio-chamada" className="cv-auto py-16 md:py-20 nav:py-24">
        <div className="du-container" data-reveal>
          <div className="grid gap-4 rounded-xl border border-edge bg-surface p-6 md:p-8 nav:grid-cols-[minmax(0,1fr)_auto] nav:items-center">
            <div className="grid gap-2">
              <h2 id="apoio-chamada" className="text-2xl">Quer ajudar o projeto a continuar?</h2>
              <p className="max-w-[65ch] text-muted-foreground">Conheça os níveis de apoio. Em breve.</p>
            </div>
            <div>
              <LinkButton href="/apoie">Ver os níveis de apoio</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

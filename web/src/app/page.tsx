import type { ReactNode } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { LinkButton } from "@/components/button";
import { StatusBadge } from "@/components/status-badge";
import { Presenter } from "@/components/presenter";
import { TeamScene } from "@/components/team-scene/team-scene";
import { EnergyStrip, SectionHeading } from "@/components/decor";
import { HeroLogo } from "@/components/hero-logo";
import { links } from "@/config/links";
import { assetSet } from "@/lib/asset";
import { galeria } from "@/config/galeria";

export const metadata: Metadata = pageMetadata({
  title: "Dragon Universe | Dragon Ball no Minecraft Bedrock",
  description:
    "Add-on gratuito de fãs que leva Dragon Ball ao Minecraft Bedrock: 6 raças já no jogo, transformações, ataques de ki e 47 missões. Versão de teste.",
  path: "/",
});

// Destaques (copy v2 §2.3). Cada card leva à categoria da wiki.
const metricas = [
  ["6", "raças já no jogo"],
  ["47", "missões principais"],
  ["100+", "personagens e inimigos"],
  ["200+", "itens"],
  ["140+", "roupas e armaduras"],
] as const;

const recursos: { nome: string; href: string; texto: ReactNode }[] = [
  { nome: "Raças", href: "/wiki/racas", texto: <><strong>6 raças já no jogo</strong>, cada uma com bônus e transformações próprios: Terráqueo, Saiyajin, Namekuseijin, Raça do Freeza, Majin e Bio-Android. Em desenvolvimento: Glind, Cerealianos e uma nova raça estilo Moro.</> },
  { nome: "Transformações", href: "/wiki/transformacoes", texto: <>Do <strong>Super Saiyajin ao Ultra Ego</strong>. Linha Saiyajin, formas da Raça do Freeza até a Golden e a Black, e formas globais.</> },
  { nome: "Ataques de ki", href: "/wiki/ataques-de-ki", texto: <><strong>Kamehameha, Galick Gun, Final Flash, Makankosappo, Genki Dama, Kienzan</strong> e disparos de ki.</> },
  { nome: "Planetas", href: "/wiki/planetas-e-dimensoes", texto: <><strong>Viaje de nave</strong> entre Terra, Namekusei, Planeta Vegeta, Planeta Freeza, Yardrat e mais.</> },
  { nome: "História", href: "/wiki/historia-e-sagas", texto: <><strong>47 missões principais</strong>, da Saga dos Saiyajins à Saga do Futuro Trunks, além de missões secundárias, desafios e conquistas.</> },
  { nome: "Multiplayer", href: "/wiki/multiplayer", texto: <><strong>Grupos, terrenos protegidos, zeni e lojas.</strong></> },
];

const chip = "border border-border bg-raised px-2 py-1 font-display text-sm leading-[1.57] font-semibold text-text";

export default function HomePage() {
  const hero = galeria[0];
  return (
    <>
      <section aria-labelledby="titulo-home" className="pt-8 pb-16 md:pt-12 md:pb-20 nav:pb-24">
        <div className="du-container grid gap-8 nav:grid-cols-[minmax(0,5fr)_minmax(0,7.103fr)] nav:items-start nav:gap-6">
          <div className="min-w-0">
            <div aria-label="Informações do projeto" className="mb-6 flex flex-wrap gap-2">
              <span className={chip}>Versão de teste 1.7.1E</span>
              <span className={chip}>Minecraft Bedrock</span>
              <span className={chip}>Projeto de fãs</span>
            </div>
            <h1 id="titulo-home" className="mb-6 [overflow-wrap:anywhere]">
              Dragon Ball dentro do Minecraft Bedrock. Feito por fãs, <span className="text-brand">em evolução de verdade.</span>
            </h1>
            <p className="max-w-[48ch] text-lg">
              O Dragon Universe é um add-on <strong>gratuito</strong>, feito por fãs, com 6 raças já no jogo, transformações, ataques de ki, 47 missões principais e viagem entre planetas. Criado pela equipe Dragon Universe, com nome e identidade próprios.
            </p>
            <p className="mt-4 max-w-[52ch] text-sm text-muted-foreground">Versão 1.7.1E em teste da equipe. Funciona em PC e celular. Ainda não existe versão pública.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <LinkButton href={links.discord} variant="primary" external>
                Entrar no Discord
              </LinkButton>
              <LinkButton href={links.github} external>
                Ver no GitHub
              </LinkButton>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/wiki" className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">
                Explorar a wiki
              </Link>
              <Link href="/instalar" className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">
                Como instalar
              </Link>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-edge bg-surface shadow-block-card">
            <EnergyStrip variant="hero" className="h-8 border-b-2 border-bg" />
            <div className="px-4 py-6 md:px-6 md:py-8">
              <HeroLogo />
            </div>
            <figure className="border-t border-edge">
              <img
                src={hero.src}
                srcSet={assetSet("/img/planeta-do-bills-360.webp 360w, /img/planeta-do-bills-859.webp 859w")}
                sizes="(min-width: 1100px) 640px, calc(100vw - 2rem)"
                fetchPriority="high"
                alt={hero.alt}
                width={hero.width}
                height={hero.height}
                className="h-auto w-full"
              />
              <figcaption className="grid gap-3 border-t border-edge bg-surface p-5 text-sm md:p-6">
                <StatusBadge status="preview" />
                <span>
                  <strong>Planeta do Bills.</strong> Ainda não está no add-on.
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section aria-labelledby="o-que-e" className="bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container">
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
        </div>
      </section>

      <section aria-labelledby="recursos" className="py-16 md:py-20 nav:py-24">
        <div className="du-container">
          <SectionHeading id="recursos" stars lead="Tudo aqui existe na versão de teste 1.7.1E. Clique para abrir na wiki.">
            O que já está no jogo
          </SectionHeading>
          {/* Cores de marca e superfícies neutras: uma categoria geral não herda a paleta de uma transformação (B6). */}
          <ul className="grid gap-6 md:grid-cols-2 nav:grid-cols-3">
            {recursos.map((r) => (
              <li key={r.nome} className="min-w-0">
                <Link
                  href={r.href}
                  className="flex h-full flex-col rounded-xl border border-edge bg-surface text-text shadow-block-card hover:bg-raised"
                >
                  <EnergyStrip variant="brand" className="h-14 shrink-0 border-b-2 border-bg md:h-[4.5rem]" />
                  <span className="flex flex-1 flex-col items-start gap-4 p-5 md:p-6">
                    <h3 className="text-brand">{r.nome}</h3>
                    <StatusBadge status="live" />
                    <span className="text-base">{r.texto}</span>
                    <span className="mt-auto pt-1 text-sm text-brand underline underline-offset-[0.2em]">Explorar na wiki</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul aria-label="Conteúdo da versão de teste" className="mt-8 grid grid-cols-2 gap-4 md:gap-6 nav:grid-cols-5">
            {metricas.map(([n, rotulo]) => (
              <li key={rotulo} className="grid min-w-0 content-start gap-1 rounded-xl border border-edge bg-surface p-5 last:col-span-full nav:last:col-auto">
                <strong className="font-display text-4xl leading-tight text-brand">{n}</strong>
                <span className="text-sm text-muted-foreground">{rotulo}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="novidades-teaser" className="bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container">
          <div className="rounded-xl border border-edge bg-bg shadow-block-card">
            <EnergyStrip variant="news" className="h-4" />
            <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 md:p-8">
              <div className="grid gap-3">
                <h2 id="novidades-teaser" className="text-2xl">Novidades</h2>
                <p className="max-w-[65ch] text-muted-foreground"><strong className="text-text">Novidades até a versão 1.7.1E.</strong> Novo nome e logo, estruturas únicas por mundo, voo mais suave, Kaioken reequilibrado e muito mais.</p>
              </div>
              <div><LinkButton href="/novidades">Ver as novidades</LinkButton></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="desenvolvimento-teaser" className="py-16 md:py-20 nav:py-24">
        <div className="du-container">
          <SectionHeading id="desenvolvimento-teaser">Em desenvolvimento</SectionHeading>
          <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] nav:gap-12">
            <div className="min-w-0">
              <p className="max-w-[65ch] text-muted-foreground"><strong className="text-text">Construções novas em desenvolvimento.</strong> Planeta do Bills, Torneio do Poder, Corporação Cápsula e outras. São prévias e <strong className="text-text">não estão no add-on hoje</strong>.</p>
              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {galeria.slice(1, 4).map((item) => (
                  <li key={item.src} className="min-w-0 rounded-xl border border-edge bg-surface">
                    <img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" className="h-auto w-full" />
                    <div className="grid gap-2 border-t border-edge p-4">
                      <StatusBadge status="preview" />
                      <span className="text-sm text-muted-foreground">{item.caption}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="/roadmap">Ver o que vem por aí</LinkButton>
                <LinkButton href="/galeria">Ver a galeria</LinkButton>
              </div>
            </div>
            <Presenter narrow src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, apresentando a seção.">
              Aqui é o Ricardo (@rvmm). Estas são prévias das minhas construções, ainda em andamento. Nenhuma está no add-on por enquanto.
            </Presenter>
          </div>
        </div>
      </section>

      <section aria-labelledby="equipe-teaser" className="bg-surface py-16 md:py-20 nav:py-24">
        <div className="du-container">
          <SectionHeading id="equipe-teaser" lead="Três fãs, um add-on. Conheça João, Ricardo e Luan.">
            Quem faz o Dragon Universe
          </SectionHeading>
          <TeamScene />
          <div className="mt-6"><LinkButton href="/equipe">Conhecer a equipe</LinkButton></div>
        </div>
      </section>

      <section aria-labelledby="cta-final" className="py-16 md:py-20 nav:py-24">
        <div className="du-container">
          <div className="rounded-xl border border-edge bg-surface shadow-block-card">
            <EnergyStrip variant="cta" className="h-6" />
            <div className="grid gap-5 p-6 md:p-8 nav:grid-cols-[minmax(0,1fr)_auto] nav:items-center nav:gap-8">
              <div className="grid gap-3">
                <h2 id="cta-final" className="text-3xl">Quer acompanhar o projeto?</h2>
                <p className="max-w-[65ch] text-muted-foreground">Entre no Discord para saber das novidades e conversar com a equipe e a comunidade.</p>
              </div>
              <div className="flex flex-wrap gap-4 nav:justify-end">
                <LinkButton href={links.discord} variant="primary" external>
                  Entrar no Discord
                </LinkButton>
                <LinkButton href={links.github} external>
                  Ver no GitHub
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

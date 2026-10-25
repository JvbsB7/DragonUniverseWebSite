import { Diamond } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Presenter } from "@/components/presenter";
import { StatusBadge, type Status } from "@/components/status-badge";
import { LinkButton } from "@/components/button";
import { Expandable } from "@/components/expandable";
import { ConteudoFuturo } from "@/components/conteudo-futuro";
import { RoadmapFilter } from "@/components/roadmap-filter";
import { galeria } from "@/config/galeria";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Em desenvolvimento e planejado | Dragon Universe",
  description: "O que o Dragon Universe já tem, o que está em desenvolvimento e o que é planejado. Sem datas e sem promessa de entrega.",
  path: "/roadmap",
});

// Em desenvolvimento (copy v3 §8.2): raças e habilidades novas e as prévias de construções.
const emDesenvolvimento: { nome: string; texto: string; href: string; status: Extract<Status, "dev"> }[] = [
  { nome: "Glind", texto: "A raça já existe no add-on e está sendo melhorada antes de ser liberada.", href: "/wiki/racas/glind", status: "dev" },
  { nome: "Cerealianos", texto: "Raça nova, junto com o Planeta Cereal.", href: "/wiki/racas/cerealianos", status: "dev" },
  { nome: "Nova raça (estilo Moro)", texto: "Nova raça com habilidades inspiradas no Moro. Nome a definir.", href: "/wiki/racas/nova-raca-estilo-moro", status: "dev" },
  { nome: "Habilidades estilo Moro", texto: "Habilidades mágicas inspiradas no Moro.", href: "/wiki/tecnicas/habilidades-estilo-moro", status: "dev" },
];

// Planejado (v2 §6, menos o que agora está em desenvolvimento). Sem datas: não são promessa de entrega.
const planejado = [
  { grupo: "Estabilidade", itens: ["Proteção do progresso salvo", "Esferas do Dragão e desejos corrigidos", "Voo reformulado (sem peso nem tremedeira, com carga de ki enquanto voa)"] },
  { grupo: "Novos treinos", itens: ["Treino físico com flexões", "Treino mental contra réplicas de chefes", "Nova tela de concentração"] },
  { grupo: "Raças e formas", itens: ["Namekuseijin Full Power", "Cell Max", "Tsufurujins", "Passivas raciais"] },
  { grupo: "Lugares", itens: ["Planeta Cereal", "Planeta do Kaioshin Supremo e Universo 6 completos", "A história continuando depois da Saga do Futuro Trunks"] },
  { grupo: "Eventos dinâmicos", itens: ["Invasões do Exército do Freeza, com um Freeza Negro raro"] },
  { grupo: "Mundo vivo", itens: ["Títulos e facções", "NPCs úteis", "Novos conjuntos de Esferas do Dragão (Super, Daima e Cereal)"] },
];

export default function RoadmapPage() {
  return (
    <div className="du-container flex max-w-6xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-3">
        <h1>Em desenvolvimento e planejado</h1>
        <p className="max-w-[65ch] text-lg text-muted-foreground">
          O que a equipe construiu, o que está construindo e o que vem pela frente. <strong className="text-text">Sem datas, sem percentuais e sem promessa de entrega.</strong>
        </p>
        <p className="text-sm text-muted-foreground">Mostramos o estado de cada item com palavras, não com porcentagem.</p>
      </header>

      <RoadmapFilter>
        <ol aria-label="Linha do tempo do desenvolvimento" className="trilho grid gap-12">
          <li data-secao="live" className="min-w-0">
            <section aria-labelledby="ja-no-jogo" className="grid gap-3">
              <h2 id="ja-no-jogo">Já no jogo</h2>
              <StatusBadge status="live" />
              <p className="max-w-[65ch]">Tudo que a wiki marca como Já no jogo, na versão de teste 1.7.1E.</p>
              <div><LinkButton href="/novidades">Ver Novidades</LinkButton></div>
            </section>
          </li>

          <li data-secao="dev" className="min-w-0">
            <section aria-labelledby="em-desenvolvimento" className="grid gap-6">
              <h2 id="em-desenvolvimento">Em desenvolvimento</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {emDesenvolvimento.map((i) => (
                  <li key={i.nome} className="grid min-w-0 content-start gap-2 rounded-xl border border-edge bg-surface p-5">
                    <StatusBadge status={i.status} />
                    <h3 className="text-xl">{i.nome}</h3>
                    <p className="text-muted-foreground">{i.texto}</p>
                    <Expandable rotulo="Ver detalhes" rotuloAberto="Fechar detalhes">
                      <p className="pt-1 text-muted-foreground">
                        Ainda não está no add-on e não tem data de chegada.{" "}
                        <Link href={i.href} className="du-text-link">
                          Ver a página de {i.nome}
                        </Link>
                        .
                      </p>
                    </Expandable>
                  </li>
                ))}
              </ul>

              <div className="grid min-w-0 content-start gap-3 rounded-xl border border-edge bg-surface p-5 md:p-6">
                <StatusBadge status="preview" />
                <h3 className="text-xl">Prévias de construções</h3>
                <p className="max-w-[65ch] text-muted-foreground">
                  Planeta do Bills · Torneio do Poder · Corporação Cápsula · Casa do Guru, em Namekusei · Torneio de Artes Marciais · Nave do Freeza · Castelo do Rei Vegeta · Prisão Galáctica · NPCs novos. Em desenvolvimento: nenhuma está no add-on hoje.
                </p>
                <Presenter src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, apresentando as construções.">
                  Aqui é o Ricardo (@rvmm). Estas são prévias das minhas construções, ainda em andamento. Nenhuma está no add-on por enquanto.
                </Presenter>
                <Expandable rotulo="Ver detalhes" rotuloAberto="Fechar detalhes" montarAoAbrir>
                  <ul className="grid gap-4 pt-2 sm:grid-cols-2 nav:grid-cols-3">
                    {galeria.map((item) => (
                      <li key={item.src} className="min-w-0 overflow-hidden rounded-xl border border-edge bg-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" className="aspect-[4/3] w-full object-contain" />
                        <div className="flex flex-col gap-2 border-t border-edge p-4">
                          <StatusBadge status="preview" />
                          <Link href={item.wiki} className="font-display font-semibold underline underline-offset-4 hover:text-brand">
                            {item.caption}
                          </Link>
                          <span className="text-sm text-muted-foreground">Em desenvolvimento. Ainda não está no add-on.</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-4 font-display font-semibold">
                    Estas imagens mostram o que a equipe está construindo. Elas não estão no add-on hoje e não têm data de chegada.
                  </p>
                </Expandable>
              </div>
            </section>
          </li>

          <li data-secao="test" className="min-w-0">
            <section aria-labelledby="em-teste" className="grid gap-3">
              <h2 id="em-teste">Em teste</h2>
              <StatusBadge status="test" />
              <p className="max-w-[65ch]">
                <strong>Versão 1.7.1E</strong> — em teste da equipe. Veja o que mudou em{" "}
                <Link href="/novidades" className="du-text-link">Novidades</Link>.
              </p>
              <p className="max-w-[65ch] text-muted-foreground">Histórico de versões: a lista completa fica em Novidades.</p>
            </section>
          </li>

          <li data-secao="planned" className="min-w-0">
            <div className="grid gap-12">
              <section aria-labelledby="planejado" className="grid gap-6">
                <header className="grid gap-3">
                  <h2 id="planejado">Planejado</h2>
                  <p className="max-w-[65ch] text-muted-foreground">
                    Estes itens estão <strong className="text-text">planejados</strong>. Não têm data e não são promessa de entrega.
                  </p>
                  <div><StatusBadge status="planned" /></div>
                </header>
                <div className="grid gap-4 sm:grid-cols-2 nav:grid-cols-3">
                  {planejado.map((g) => (
                    <div key={g.grupo} className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-5">
                      <h3 className="text-lg">{g.grupo}</h3>
                      <ul className="flex flex-col gap-2 text-muted-foreground">
                        {g.itens.map((i) => (
                          <li key={i} className="flex gap-2">
                            <Diamond aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-planned-fg" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
              <ConteudoFuturo headingId="conteudo-futuro" />
            </div>
          </li>
        </ol>
      </RoadmapFilter>

      <section aria-labelledby="acompanhe" className="grid gap-3">
        <h2 id="acompanhe" className="text-2xl">Quer acompanhar de perto?</h2>
        <p className="text-muted-foreground">O roadmap muda conforme o projeto evolui. Quer acompanhar de perto? Fique de olho no Discord.</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
          <LinkButton href={links.github} external>Acompanhar no GitHub</LinkButton>
        </div>
      </section>
    </div>
  );
}

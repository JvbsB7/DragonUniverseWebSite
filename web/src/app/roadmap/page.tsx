import { Diamond } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Presenter } from "@/components/presenter";
import { StatusBadge } from "@/components/status-badge";
import { LinkButton } from "@/components/button";
import { galeria } from "@/config/galeria";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Em desenvolvimento e planejado | Dragon Universe",
  description: "Prévias das construções novas e o que a equipe planeja para o add-on. Sem datas e sem promessa de entrega.",
  path: "/roadmap",
});

// Itens planejados (copy §8). Sem datas: não são promessa de entrega.
const planejado = [
  { grupo: "Estabilidade", itens: ["Proteção do progresso salvo", "Esferas do Dragão e desejos corrigidos", "Voo reformulado (sem peso nem tremedeira, com carga de ki enquanto voa)"] },
  { grupo: "Novos treinos", itens: ["Treino físico com flexões", "Treino mental contra réplicas de chefes", "Nova tela de concentração"] },
  { grupo: "Raças e formas", itens: ["Namekuseijin Full Power", "Cell Max", "Cerealianos", "Tsufurujins", "Habilidades no estilo do Moro", "Passivas raciais"] },
  { grupo: "Lugares", itens: ["Planeta do Bills", "Torneio do Poder", "Planeta Cereal", "Planeta do Kaioshin Supremo e Universo 6 completos", "A história continuando depois da Saga do Futuro Trunks"] },
  { grupo: "Eventos dinâmicos", itens: ["Invasões do Exército do Freeza, com um Freeza Negro raro"] },
  { grupo: "Mundo vivo", itens: ["Títulos e facções", "NPCs úteis", "Novos conjuntos de Esferas do Dragão (Super, Daima e Cereal)"] },
];

export default function RoadmapPage() {
  return (
    <div className="du-container flex max-w-6xl flex-col gap-14 py-14 md:py-16">
      <header className="flex flex-col gap-3">
        <h1>Em desenvolvimento e planejado</h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          O que a equipe está construindo e o que vem pela frente. <strong className="text-text">Sem datas e sem promessa de entrega.</strong>
        </p>
      </header>

      <section aria-labelledby="em-desenvolvimento" className="flex flex-col gap-6">
        <h2 id="em-desenvolvimento">Em desenvolvimento</h2>
        <Presenter src="/skins/rvmm.png" name="Ricardo Vinicius" handle="@rvmm" alt="Ricardo Vinicius, o @rvmm, com moletom vermelho e cabelo vermelho e preto, apresentando as construções.">
          Aqui é o Ricardo (@rvmm). Estas são prévias das minhas construções, ainda em andamento. Nenhuma está no add-on por enquanto.
        </Presenter>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galeria.map((item) => (
            <li key={item.src} className="min-w-0 border-2 border-border bg-surface">
              <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" className="h-auto w-full" />
              <div className="flex flex-col gap-2 border-t-2 border-border p-4">
                <StatusBadge status="preview" />
                <Link href={item.wiki} className="font-display font-semibold underline underline-offset-4 hover:text-brand">
                  {item.caption}
                </Link>
                <span className="text-sm text-muted-foreground">Em desenvolvimento. Ainda não está no add-on.</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="font-display font-semibold">
          Estas imagens mostram o que a equipe está construindo. Elas não estão no add-on hoje e não têm data de chegada.
        </p>
      </section>

      <section aria-labelledby="planejado" className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h2 id="planejado">Planejado</h2>
          <p className="max-w-prose text-muted-foreground">
            Estes itens estão <strong className="text-text">planejados</strong>. Não têm data e não são promessa de entrega.
          </p>
          <div>
            <StatusBadge status="planned" />
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planejado.map((g) => (
            <div key={g.grupo} className="flex flex-col gap-3 rounded-md border-2 border-border bg-surface p-5">
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
        <p className="text-muted-foreground">O roadmap muda conforme o projeto evolui. Quer acompanhar de perto? Fique de olho no Discord.</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={links.discord} variant="primary" external>Entrar no Discord</LinkButton>
          <LinkButton href={links.github} external>Acompanhar no GitHub</LinkButton>
        </div>
      </section>
    </div>
  );
}

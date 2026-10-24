import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { StatusBadge } from "@/components/status-badge";
import { LinkButton } from "@/components/button";
import { links } from "@/config/links";

export const metadata: Metadata = pageMetadata({
  title: "Novidades | Dragon Universe",
  description: "Tudo o que mudou até a versão 1.7.1E: nova identidade, estruturas únicas, voo mais suave, correções de história e mais.",
  path: "/novidades",
});

const grupos = [
  { titulo: "Nova identidade", itens: ["Novo nome e novo logo azul. Nasce o Dragon Universe."] },
  {
    titulo: "Mundo",
    itens: [
      "Estruturas únicas por mundo: uma Casa do Kame, uma Casa do Goku, uma arena dos Jogos de Cell e uma nave do Babidi.",
      "Cidades: até 3 Cidades do Oeste e 5 cidades.",
      "Planetas sem mobs comuns do Minecraft. Nos planetas não nascem mobs regulares do jogo.",
    ],
  },
  {
    titulo: "Combate, voo e som",
    itens: ["Voo mais suave, com animação melhorada.", "Som da Genki Dama adicionado.", "Sons do Final Flash e barra de ki corrigidos."],
  },
  {
    titulo: "História e viagem",
    itens: ["A Saga do Freeza agora encontra Namekusei.", "Missões da Saga do Futuro Trunks consertadas.", "A viagem entre planetas volta para o lugar certo."],
  },
  {
    titulo: "Novos blocos e receitas",
    itens: ["Laje de azulejo vermelho, musgo medicinal plantável e faixa de cabeça."],
  },
  {
    titulo: "Da versão do Ricardo (1.7.1E)",
    itens: [
      "Aldeões dos planetas redesenhados: Saiyajins (agora com cauda), Freeza, Yardrat e Inferno, com modelos e texturas novos.",
      "Kaioken reequilibrado: menos perda de vida e um nível máximo mais justo.",
      "Soldados do Freeza com nível e força consistentes.",
      "Casa do Goku e planeta do Senhor Kaioh refeitos.",
      "Nova textura do Potencial Desbloqueado Namekuseijin.",
      "Ajustes nas recompensas (Korin, roupa da Bulma).",
    ],
  },
];

export default function NovidadesPage() {
  return (
    <div className="du-container flex max-w-3xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-4">
        <h1>Novidades</h1>
        <p className="text-lg text-muted-foreground">O projeto está andando. Isto já foi feito e está na versão de teste.</p>
        <div>
          <StatusBadge status="live" />
        </div>
      </header>

      <section aria-labelledby="versao" className="flex flex-col gap-8">
        <h2 id="versao">
          Versão 1.7.1E <span className="text-base font-normal text-muted-foreground">(em teste da equipe)</span>
        </h2>
        {grupos.map((g, i) => (
          <div key={g.titulo} role="group" aria-labelledby={`grupo-${i}`} className="flex flex-col gap-4">
            <h3 id={`grupo-${i}`} className="text-brand">{g.titulo}</h3>
            <ul className="flex flex-col gap-3">
              {g.itens.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-md border-2 border-border bg-surface p-4">
                  <StatusBadge status="live" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="text-muted-foreground">
        Quer saber do que vem pela frente? Veja <Link href="/roadmap" className="text-brand underline underline-offset-4">Em desenvolvimento e planejado</Link>.
      </p>
      <div className="flex flex-wrap gap-3">
        <LinkButton href={links.discord} variant="primary" external>
          Entrar no Discord
        </LinkButton>
      </div>
    </div>
  );
}

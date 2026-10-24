import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LinkButton } from "@/components/button";
import { links } from "@/config/links";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Perguntas frequentes | Dragon Universe",
  description: "Respostas sobre o Dragon Universe: requisitos, PC e celular, gratuito, versão de teste, wiki e apoio.",
  path: "/faq",
});

const a = "text-brand underline underline-offset-4";

type Pergunta = { p: string; r: ReactNode };

// FAQ (copy v2 §11).
const grupos: { titulo: string; perguntas: Pergunta[] }[] = [
  {
    titulo: "Geral",
    perguntas: [
      {
        p: "O Dragon Universe é o Dragon Evolution?",
        r: <>Não. O Dragon Universe é um add-on de fãs criado pela equipe Dragon Universe, com <strong>nome e identidade próprios</strong>. Ele é <strong>inspirado no Dragon Evolution, de About04.</strong></>,
      },
      {
        p: "Já posso baixar?",
        r: <>Ainda não. A versão <strong>1.7.1E</strong> está em teste da equipe e <strong>não existe versão pública estável</strong>. Quando houver, o botão de download será ativado aqui. O add-on é gratuito.</>,
      },
      {
        p: "O que eu preciso para jogar?",
        r: <><strong>Minecraft Bedrock 26.52</strong> com o experimento <strong>Beta APIs</strong> ativado no mundo. Como é versão de teste, <strong>faça backup do seu mundo</strong>.</>,
      },
      {
        p: "Funciona no celular e no PC?",
        r: <>Sim. <strong>Por enquanto, o Dragon Universe funciona em PC e celular</strong>, com <strong>Minecraft Bedrock 26.52</strong> e o experimento <strong>Beta APIs</strong> ativado. Sobre console, ainda não temos confirmação.</>,
      },
      {
        p: "É de graça?",
        r: <>Sim, o add-on é <strong>gratuito</strong>. Haverá <strong>planos opcionais</strong> para quem quiser apoiar o projeto. Eles estão <strong>Em breve</strong>, ainda sem valores, e você não precisa deles para jogar.</>,
      },
      {
        p: "Tem tradução?",
        r: <>Sim. <strong>No jogo</strong>, há português, inglês e espanhol. O site está só em português.</>,
      },
      {
        p: "Vai estragar meu mundo?",
        r: <>É uma <strong>versão de teste</strong>, então pode haver falhas. <strong>Faça backup do seu mundo</strong> antes de testar.</>,
      },
      {
        p: "Isso é oficial?",
        r: <>Não. É um <strong>projeto de fãs, sem vínculo oficial</strong>. Dragon Ball é propriedade de Akira Toriyama, Shueisha e Toei Animation. Minecraft é marca da Mojang/Microsoft.</>,
      },
      {
        p: "Quem está por trás do projeto?",
        r: <>João Vitor (@jvbs), Ricardo Vinicius (@rvmm) e Luan Dias (@luan_dias). Veja a página <Link href="/equipe" className={a}>Equipe</Link>.</>,
      },
      {
        p: "Posso apoiar o projeto?",
        r: <>O add-on é gratuito e os planos de apoio serão <strong>opcionais</strong>. A página <Link href="/apoie" className={a}>Apoie</Link> está como <strong>Em breve</strong>: ainda não há planos, valores nem forma de pagamento. Entre no Discord para ser avisado.</>,
      },
      {
        p: "O projeto vai continuar?",
        r: <>A equipe Dragon Universe segue desenvolvendo o add-on. As melhorias já feitas estão em <Link href="/novidades" className={a}>Novidades</Link> e o que vem pela frente está em <Link href="/roadmap" className={a}>Em desenvolvimento e planejado</Link>. <strong>Não prometemos datas.</strong></>,
      },
    ],
  },
  {
    titulo: "Sobre a wiki",
    perguntas: [
      {
        p: "O que é a wiki?",
        r: <>É o lugar onde reunimos o que o add-on tem: raças, transformações, ataques de ki, técnicas, planetas, história e mais. Cada página diz se aquilo <strong>já está no jogo</strong>, está <strong>em desenvolvimento</strong> ou é <strong>planejado</strong>.</>,
      },
      {
        p: "Como eu sei se algo já está no jogo?",
        r: <>Pelo selo de status no topo de cada página: <strong>Já no jogo</strong>, <strong>Em desenvolvimento</strong> ou <strong>Planejado</strong>. Só o que tem o selo <strong>Já no jogo</strong> existe hoje na versão de teste.</>,
      },
      {
        p: 'Por que algumas páginas dizem "a confirmar"?',
        r: <>Porque a equipe ainda está verificando aquele detalhe. Preferimos escrever menos a escrever algo errado.</>,
      },
      {
        p: "Por que as páginas ainda não têm imagens?",
        r: <>Estamos reunindo os prints do jogo. Enquanto isso, você vê &ldquo;Imagem em breve&rdquo;. Só usamos imagens do próprio jogo e das construções da equipe.</>,
      },
      {
        p: "Achei um erro ou falta algo na wiki. O que faço?",
        r: <>Conte para a equipe no Discord.</>,
      },
      {
        p: "Posso ajudar a melhorar a wiki?",
        r: <>Por enquanto, a melhor forma é avisar a equipe no Discord. Se isso mudar, a novidade aparece aqui.</>,
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="du-container flex max-w-3xl flex-col gap-10 py-14 md:py-16">
      <header className="flex flex-col gap-3">
        <h1>Perguntas frequentes</h1>
      </header>

      {grupos.map((g, i) => (
        <section key={g.titulo} aria-labelledby={`grupo-${i}`} className="flex flex-col gap-3">
          <h2 id={`grupo-${i}`} className="text-brand">{g.titulo}</h2>
          {g.perguntas.map((item) => (
            <details key={item.p} className="group rounded-md border-2 border-border bg-surface p-4 open:border-brand">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.p}
                <Plus aria-hidden="true" className="size-5 shrink-0 text-brand transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-muted-foreground">{item.r}</p>
            </details>
          ))}
        </section>
      ))}

      <div>
        <LinkButton href={links.discord} variant="primary" external>
          Tirar mais dúvidas no Discord
        </LinkButton>
      </div>
    </div>
  );
}

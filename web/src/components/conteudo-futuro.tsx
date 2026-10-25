import Link from "next/link";
import { StatusBadge, type Status } from "@/components/status-badge";

// Conteúdo Futuro (copy v3 §10 e A.10, texto exato): planos da equipe, sem data e sem ligação com os níveis de apoio.
// Nunca vai ao lado dos cards de apoio. Sem arte conceitual por enquanto: "Imagem em breve" não é repetido por card.
const itens: { titulo: string; texto: string; status: Extract<Status, "planned" | "dev"> }[] = [
  { titulo: "Conteúdo experimental estilo Moro", texto: "Habilidades mágicas inspiradas no Moro. Em desenvolvimento.", status: "dev" },
  { titulo: "Cerealianos", texto: "Uma raça nova, junto com o Planeta Cereal. Em desenvolvimento.", status: "dev" },
  { titulo: "Roupas inspiradas em anime", texto: "Ideias de roupas inspiradas no anime. Ainda em fase de conceito.", status: "planned" },
  { titulo: "Itens cosméticos", texto: "Itens de visual. Ainda em fase de conceito.", status: "planned" },
  { titulo: "Equipamento inicial", texto: "Ideias de equipamento para quem começa. Ainda em fase de conceito.", status: "planned" },
  { titulo: "Novas transformações", texto: "Formas novas que a equipe quer trazer. Sem lista nem data.", status: "planned" },
  { titulo: "Habilidades adicionais", texto: "Habilidades novas além das que já existem. Sem lista nem data.", status: "planned" },
];

export function ConteudoFuturo({ headingId = "conteudo-futuro", nivel = 2, compacto = false }: { headingId?: string; nivel?: 2 | 3; compacto?: boolean }) {
  const H = nivel === 2 ? "h2" : "h3";
  return (
    <div>
      <H id={headingId} className="mb-3">Conteúdo Futuro</H>
      <p className="max-w-[65ch] text-muted-foreground">O que a equipe pensa em construir para o add-on. São planos, não ofertas, e nenhum deles tem data.</p>
      <p role="note" className="mt-4 max-w-[65ch] rounded-xl border border-gold bg-alert-bg p-4 text-alert-fg">
        <strong>Isto é planejamento, não é produto à venda.</strong> Nada desta seção faz parte dos níveis de apoio, e nada daqui será vendido dentro do add-on.
      </p>
      <ul className={compacto ? "mt-6 grid gap-3" : "mt-6 grid gap-4 md:grid-cols-2 nav:grid-cols-3"}>
        {itens.map((i) => (
          <li key={i.titulo} className="grid min-w-0 content-start gap-2 rounded-xl border border-edge bg-surface p-5">
            <StatusBadge status={i.status} />
            <h3 className="text-xl">{i.titulo}</h3>
            <p className="text-muted-foreground">{i.texto}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[65ch] text-muted-foreground">
        Quer entender o que é apoio e o que é plano de conteúdo? Apoio é sobre a comunidade (veja{" "}
        <Link href="/apoie" className="du-text-link">Apoie o Dragon Universe</Link>). Plano de conteúdo é sobre o jogo, e o jogo continua gratuito.
      </p>
    </div>
  );
}

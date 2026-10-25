// Níveis de apoio (BRIEF V3 §11 e copy v3 §9 / A.9). Nomes, preços e benefícios foram dados pelo João; o texto é o da copy.
// Todos os controles ficam desativados ("Em breve"): sem checkout, sem assinatura simulada e sem benefício dentro do jogo.
// Não há JSON-LD de oferta (Offer/Product) de propósito: preço em marcação estruturada sugeriria uma oferta ativa.
export type Nivel = {
  id: "guerreiro" | "super-guerreiro" | "lendario";
  nome: string;
  preco: string;
  tema: string;
  destaque?: boolean;
  beneficios: string[];
  /** Linha que antecede a lista quando o nível herda os anteriores. */
  inclui?: string;
};

export const niveis: Nivel[] = [
  {
    id: "guerreiro",
    nome: "Guerreiro",
    preco: "R$ 15,90/mês",
    tema: "O começo da jornada do guerreiro.",
    beneficios: [
      "Cargo especial de apoiador no Discord",
      "Acesso às novidades de desenvolvimento para apoiadores",
      "Acesso a conteúdo de bastidores, em um chat exclusivo no Discord",
      "Nome nos créditos de apoiadores, se você quiser aparecer",
      "Reconhecimento na comunidade",
    ],
  },
  {
    id: "super-guerreiro",
    nome: "Super Guerreiro",
    preco: "R$ 25,90/mês",
    tema: "Um guerreiro chegando a um nível maior de poder.",
    destaque: true,
    inclui: "Tudo do Guerreiro, mais:",
    beneficios: [
      "Cargo de apoiador aprimorado no Discord",
      "Participação nas votações da comunidade sobre o desenvolvimento",
      "Mais prévias de bastidores",
      "Informações técnicas sobre o desenvolvimento",
      "Acesso a sessões de perguntas e respostas da comunidade, quando a equipe agendar, no Discord",
    ],
  },
  {
    id: "lendario",
    nome: "Lendário",
    preco: "R$ 32,90/mês",
    tema: "O status de apoiador lendário.",
    inclui: "Tudo dos níveis anteriores, mais:",
    beneficios: [
      "Cargo de apoiador lendário no Discord",
      "Reconhecimento especial nos créditos de apoiadores, se você quiser aparecer",
      "Relatórios de desenvolvimento mais detalhados, no Discord",
      "Sessões em grupo com a equipe de desenvolvimento, quando a equipe agendar, no Discord",
      "Participação em conversas consultivas sobre recursos futuros do projeto",
    ],
  },
];

// Comparativo (copy §9.5): nove linhas do brief e duas derivadas das listas dos cards (informações técnicas e conversas
// consultivas), com valores idênticos aos benefícios de cada nível. A tabela e os cards do celular usam esta mesma fonte.
export const comparativo: { beneficio: string; valores: [boolean, boolean, boolean] }[] = [
  { beneficio: "Cargo especial no Discord", valores: [true, true, true] },
  { beneficio: "Novidades do desenvolvimento", valores: [true, true, true] },
  { beneficio: "Créditos de apoiadores (opcional)", valores: [true, true, true] },
  { beneficio: "Conteúdo de bastidores", valores: [true, true, true] },
  { beneficio: "Votações da comunidade", valores: [false, true, true] },
  { beneficio: "Prévias adicionais do desenvolvimento", valores: [false, true, true] },
  { beneficio: "Informações técnicas sobre o desenvolvimento", valores: [false, true, true] },
  { beneficio: "Perguntas e respostas em grupo", valores: [false, true, true] },
  { beneficio: "Relatórios detalhados de desenvolvimento", valores: [false, false, true] },
  { beneficio: "Sessões especiais com a equipe", valores: [false, false, true] },
  { beneficio: "Conversas consultivas sobre recursos futuros", valores: [false, false, true] },
];

export const perguntas: { p: string; r: string }[] = [
  { p: "Preciso pagar para jogar?", r: "Não. O add-on do Dragon Universe é gratuito e continua gratuito." },
  { p: "O apoio libera algo dentro do jogo?", r: "Não. Nenhuma raça, roupa, equipamento, transformação ou habilidade depende de apoio. Os benefícios são da comunidade." },
  { p: "Já dá para apoiar?", r: "Ainda não. Os planos estão em breve e nenhuma cobrança está aberta. Avisamos no Discord quando houver novidade." },
  { p: "Posso aparecer nos créditos?", r: "Sim, se você quiser. Aparecer é opcional." },
  { p: "O teste fechado exige apoio?", r: "Não. Testes fechados não exigem assinatura." },
  { p: "Isso é um produto oficial de Dragon Ball?", r: "Não. É um projeto de fãs, sem vínculo oficial." },
];

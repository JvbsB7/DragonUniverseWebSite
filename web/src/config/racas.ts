// Raças (copy v3 §3.3, §4.2 e §5, texto exato). Estado e grupos seguem as decisões do João (v3.2): 6 raças já no jogo,
// 3 em desenvolvimento (Glind, Cerealianos e Kaijin, a raça com habilidades inspiradas no Moro) e Tsufurujins planejada.
// "Pontos fortes" só entram quando a wiki os afirma; quando não há dado, o campo é omitido (nunca "a confirmar" na tela).
export type RacaStatus = "live" | "dev" | "planned";

export type Raca = {
  slug: string;
  nome: string;
  status: RacaStatus;
  descricao: string;
  pontosFortes?: string;
  /** Slug da wiki (categoria racas) para "Ver detalhes". */
  wiki: string;
  /** Lista sob "O que a equipe quer construir" (só em desenvolvimento, direção e não recurso pronto). */
  direcao?: string[];
};

export const racasNoJogo: Raca[] = [
  { slug: "terraqueo", nome: "Terráqueo", status: "live", wiki: "terraqueo", descricao: "Uma das raças do add-on, com bônus e transformações próprios.", pontosFortes: "Espírito e vontade." },
  { slug: "saiyajin", nome: "Saiyajin", status: "live", wiki: "saiyajin", descricao: "A raça com a maior lista de transformações: do SSJ ao SSJ4, God, Blue / Rosé, Evolution e Legendary.", pontosFortes: "Força. Tem cauda." },
  { slug: "namekuseijin", nome: "Namekuseijin", status: "live", wiki: "namekuseijin", descricao: "Tem acesso à Fusão Namekuseijin.", pontosFortes: "Constituição e regeneração." },
  { slug: "raca-do-freeza", nome: "Raça do Freeza", status: "live", wiki: "raca-do-freeza", descricao: "Formas próprias, que vão até a Golden e a Black." },
  { slug: "majin", nome: "Majin", status: "live", wiki: "majin", descricao: "Uma das raças do add-on.", pontosFortes: "Absorção e regeneração." },
  { slug: "bio-android", nome: "Bio-Android", status: "live", wiki: "bio-android", descricao: "Uma das raças do add-on. (No jogo, o nome aparece como \"Bio Androide\".)" },
];

export const racasEmDesenvolvimento: Raca[] = [
  {
    slug: "glind",
    nome: "Glind",
    status: "dev",
    wiki: "glind",
    descricao: "A raça já existe no add-on, mas a equipe ainda vai melhorá-la antes de liberá-la. Terá transformações do bem, neutras e do mal. Ainda não está liberada para jogar e não tem data de chegada.",
  },
  {
    slug: "cerealianos",
    nome: "Cerealianos",
    status: "dev",
    wiki: "cerealianos",
    descricao: "Uma raça nova que a equipe está construindo, junto com o Planeta Cereal. Ainda não está no add-on e não tem data de chegada.",
    direcao: ["Precisão aprimorada", "Percepção de energia", "Combate especializado de longa distância", "Habilidades táticas", "Progressão de habilidades própria"],
  },
  {
    slug: "kaijin",
    nome: "Kaijin",
    status: "dev",
    wiki: "kaijin",
    descricao: "A raça Kaijin é uma raça nova que a equipe está construindo, com habilidades inspiradas no Moro, de Dragon Ball. Ainda não está no add-on e não tem data de chegada.",
  },
];

export const racasPlanejadas: Raca[] = [
  { slug: "tsufurujins", nome: "Tsufurujins", status: "planned", wiki: "tsufurujins", descricao: "Raça planejada pela equipe. Sem data e sem promessa de entrega." },
];

// Habilidades estilo Moro: item de conteúdo, não raça (copy §5.3). Em desenvolvimento.
export const habilidadesMoro = {
  nome: "Habilidades estilo Moro",
  descricao: "Habilidades mágicas inspiradas no Moro, de Dragon Ball. A equipe ainda está construindo e testando. Ainda não estão no add-on e não têm data de chegada.",
  direcao: ["Absorção de energia", "Habilidades mágicas", "Gerenciamento de recursos próprio", "Transformações especializadas", "Combate equilibrado"],
  href: "/wiki/tecnicas/habilidades-estilo-moro",
};

export const textoTestes = {
  titulo: "Teste fechado",
  p1: "Hoje, os testes são feitos pela equipe.",
  p2: "Se abrirmos testes para a comunidade, avisamos no Discord, e participar não exige ser apoiador.",
  p3: "Quando o conteúdo estiver pronto, o lançamento completo será gratuito.",
  aviso: "Estes conteúdos não são benefício de apoio. Apoiar o projeto não libera raças nem habilidades.",
};

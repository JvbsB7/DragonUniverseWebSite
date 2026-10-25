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
  /** Poster 2.5D da raça (368×460 e 736×920), gerado do modelo e da textura do add-on. Sem poster, o card é textual. */
  poster?: { alt: string };
  /** Lista sob "O que a equipe quer construir" (só em desenvolvimento, direção e não recurso pronto). */
  direcao?: string[];
};

export const racasNoJogo: Raca[] = [
  { slug: "terraqueo", nome: "Terráqueo", status: "live", wiki: "terraqueo", poster: { alt: "Render do Terráqueo no add-on Dragon Universe: personagem de pele clara, sem cabelo, com sobrancelhas escuras e shorts pretos, em pose neutra." }, descricao: "Uma das raças do add-on, com bônus e transformações próprios.", pontosFortes: "Espírito e vontade." },
  { slug: "saiyajin", nome: "Saiyajin", status: "live", wiki: "saiyajin", poster: { alt: "Render do Saiyajin no add-on Dragon Universe: personagem de cabelo preto espetado, pele clara, shorts pretos e cauda marrom, em pose neutra." }, descricao: "A raça com a maior lista de transformações: do SSJ ao SSJ4, God, Blue / Rosé, Evolution e Legendary.", pontosFortes: "Força. Tem cauda." },
  { slug: "namekuseijin", nome: "Namekuseijin", status: "live", wiki: "namekuseijin", poster: { alt: "Render do Namekuseijin no add-on Dragon Universe: personagem de pele verde com antenas, ombreiras e botas vermelhas e douradas, em pose neutra." }, descricao: "Tem acesso à Fusão Namekuseijin.", pontosFortes: "Constituição e regeneração." },
  { slug: "raca-do-freeza", nome: "Raça do Freeza", status: "live", wiki: "raca-do-freeza", poster: { alt: "Render da Raça do Freeza no add-on Dragon Universe: personagem de armadura branca e rosada, partes roxas, chifres e cauda, na primeira forma." }, descricao: "Formas próprias, que vão até a Golden e a Black." },
  { slug: "majin", nome: "Majin", status: "live", wiki: "majin", poster: { alt: "Render do Majin no add-on Dragon Universe: personagem de pele rosa, com antena na cabeça e shorts pretos, em pose neutra." }, descricao: "Uma das raças do add-on.", pontosFortes: "Absorção e regeneração." },
  { slug: "bio-android", nome: "Bio-Android", status: "live", wiki: "bio-android", poster: { alt: "Render do Bio-Android no add-on Dragon Universe: personagem verde de manchas amarelas e alaranjadas, com chifres, asas e cauda, na forma Imperfeita." }, descricao: "Uma das raças do add-on. (No jogo, o nome aparece como \"Bio Androide\".)" },
];

export const racasEmDesenvolvimento: Raca[] = [
  {
    slug: "glind",
    nome: "Glind",
    status: "dev",
    wiki: "glind", poster: { alt: "Render do Glind no add-on Dragon Universe: personagem de pele azul-esverdeada, orelhas pontudas e mecha preta de cabelo, em pose neutra. Aparência provisória, em desenvolvimento." },
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

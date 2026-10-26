// Equipe (copy v2 §10; links de GitHub conferidos pelo João em v3.2, copy v3 §11.2). Só cargos confirmados pelo time (cargo do João: Desenvolvedor Full-Stack, v4-00 D1, do BRIEF_V4 escrito por ele). Os cargos do Ricardo (grafia do João) e do próprio João foram confirmados por ele.
export const equipe = [
  {
    id: "joao",
    nome: "João Vitor",
    /** Nome de jogador (BRIEF_V4, D1). */
    jogador: "JvbsBR",
    /** Pôster de corpo inteiro 3:4 (Forja): `<base>-corpo-1x-fundo.webp` e `-2x-fundo.webp`, sobre #122344. */
    preview: { base: "/img/equipe/jvbsbr", width: 296, height: 400 },
    discord: "@jvbs",
    github: { rotulo: "JvbsB7", url: "https://github.com/JvbsB7" },
    texto: "Desenvolvedor Full-Stack.",
    skin: "/skins/jvbs.png",
    alt: "Skin do João Vitor (@jvbs): cabelo preto, olhos azuis e casaco preto.",
  },
  {
    id: "ricardo",
    nome: "Ricardo Vinicius",
    jogador: "rvmm255",
    preview: { base: "/img/equipe/rvmm255", width: 296, height: 400 },
    discord: "@rvmm",
    github: { rotulo: "RicardoViniciusMachadoMartins", url: "https://github.com/RicardoViniciusMachadoMartins" },
    texto: "Desenvolvedor e Construtor no Minecraft.",
    skin: "/skins/rvmm.png",
    alt: "Skin do Ricardo Vinicius (@rvmm): moletom vermelho e cabelo vermelho e preto.",
  },
  {
    id: "luan",
    nome: "Luan Dias",
    // Sem nome de jogador: o brief não dá.
    jogador: null,
    preview: { base: "/img/equipe/luan", width: 296, height: 400 },
    discord: "@luan_dias",
    github: { rotulo: "LvDias", url: "https://github.com/LvDias" },
    texto: "Desenvolvedor da equipe Dragon Universe.",
    skin: "/skins/luan.png",
    alt: "Skin do Luan Dias (@luan_dias): cabelo branco e roupa vermelha e dourada.",
  },
] as const;

export type PessoaDaEquipe = (typeof equipe)[number];
export type IdDaPessoa = PessoaDaEquipe["id"];
/** Ordem da vitrine (v4-03 §7.1): JvbsBR · Luan · rvmm255. A ordem de `equipe` não muda. */
export const ordemDaVitrine: readonly IdDaPessoa[] = ["joao", "luan", "ricardo"];
export const tituloDaPessoa = (p: PessoaDaEquipe) => (p.jogador ? `${p.nome} · ${p.jogador}` : p.nome);
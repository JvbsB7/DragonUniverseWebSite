// Explore o Universo (copy v3 §7, texto exato; todos os destinos existem na wiki). Só destinos documentados.
// A imagem só entra quando é real e corresponde ao destino; sem imagem, o painel mostra "Imagem em breve".
export type DestinoStatus = "live" | "preview" | "planned";

export type Destino = {
  slug: string;
  nome: string;
  status: DestinoStatus;
  texto: string;
  /** Destaques da Home (o brief cita Terra, Namekusei e Planeta Vegeta). */
  destaque?: boolean;
  imagem?: { src: string; srcSet?: string; width: number; height: number; alt: string; legenda: string };
};

export const destinos: Destino[] = [
  { slug: "terra", nome: "Terra", status: "live", destaque: true, texto: "Um dos planetas do add-on. Tem 5 biomas próprios." },
  { slug: "namekusei", nome: "Namekusei", status: "live", destaque: true, texto: "Um dos planetas do add-on. A Saga do Freeza agora encontra Namekusei. A Casa do Guru é uma prévia em desenvolvimento." },
  { slug: "planeta-vegeta", nome: "Planeta Vegeta", status: "live", destaque: true, texto: "Um dos planetas do add-on. Os aldeões Saiyajins foram redesenhados e agora têm cauda." },
  { slug: "planeta-freeza", nome: "Planeta Freeza", status: "live", texto: "O planeta do Freeza. Os aldeões foram redesenhados na versão 1.7.1E." },
  { slug: "yardrat", nome: "Yardrat", status: "live", texto: "Um dos planetas do add-on. As vilas são pacíficas." },
  { slug: "inferno", nome: "Inferno", status: "live", texto: "Uma das dimensões do add-on. Os aldeões foram redesenhados na versão 1.7.1E." },
  { slug: "outro-mundo", nome: "Outro Mundo", status: "live", texto: "Uma das dimensões do add-on." },
  { slug: "camara-do-tempo", nome: "Câmara do Tempo", status: "live", texto: "Uma das dimensões do add-on. Também serve de treino." },
  { slug: "linha-do-tempo-do-futuro-trunks", nome: "Linha do tempo do Futuro Trunks", status: "live", texto: "Uma das dimensões do add-on e palco da Saga do Futuro Trunks." },
  { slug: "arena-do-universo-6", nome: "Arena do Universo 6", status: "live", texto: "Um lugar do add-on. O Universo 6 completo está planejado, sem data." },
  { slug: "planeta-do-kaioshin-supremo", nome: "Planeta do Kaioshin Supremo", status: "live", texto: "Um lugar do add-on. A versão completa está planejada, sem data." },
  { slug: "espaco", nome: "Espaço", status: "live", texto: "Um lugar do add-on, com estação orbital e asteroides." },
  {
    slug: "planeta-do-bills",
    nome: "Planeta do Bills",
    status: "preview",
    texto: "Construção nova do Ricardo. Prévia: ainda não está no add-on.",
    imagem: {
      src: "/img/planeta-do-bills-859.webp",
      srcSet: "/img/planeta-do-bills-360.webp 360w, /img/planeta-do-bills-859.webp 859w",
      width: 859,
      height: 531,
      alt: "Prévia do Planeta do Bills, construção da equipe do Dragon Universe, ainda em desenvolvimento.",
      legenda: "Planeta do Bills.",
    },
  },
  {
    slug: "planeta-rosa",
    nome: "Planeta rosa",
    status: "preview",
    texto: "Prévia de uma construção nova, com NPCs novos. Ainda não está no add-on.",
    imagem: {
      src: "/img/planeta-rosa-npc-rosa-573.webp",
      srcSet: "/img/planeta-rosa-npc-rosa-360.webp 360w, /img/planeta-rosa-npc-rosa-573.webp 573w",
      width: 573,
      height: 579,
      alt: "NPC novo de tom rosa em um planeta rosa, em desenvolvimento.",
      legenda: "NPCs novos no planeta rosa. Nomes definitivos depois.",
    },
  },
  { slug: "planeta-cereal", nome: "Planeta Cereal", status: "planned", texto: "Um lugar planejado para o add-on. Sem data e sem promessa de entrega." },
];

export const avisoUniverso = "Cada destino mostra o status. O que está em desenvolvimento ou planejado ainda não existe no add-on.";
export const comoChegar = "Como chegar: viaje de nave.";

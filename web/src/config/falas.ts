// Falas aprovadas pelo João (D34; v4-04 v4.7 §2.8). Só estas entram no site; a grafia dos golpes é a da wiki.
// Tipo: CD = grito de golpe conhecido, AD = frase original (adaptação). Locutor é lido junto: "JvbsBR diz: ...".
import type { IdDaPessoa } from "@/config/equipe";

export type Cauda = "esquerda" | "centro" | "direita";
export type FalaDe = { locutor: string; cauda: Cauda };

export const LOCUTOR: Record<IdDaPessoa, FalaDe> = {
  joao: { locutor: "JvbsBR", cauda: "esquerda" },
  luan: { locutor: "Luan Dias", cauda: "centro" },
  ricardo: { locutor: "rvmm255", cauda: "direita" },
};

/** Seleção na vitrine: alterna a cada seleção, começando pelo primeiro texto (o grito do golpe, quando há). */
export const FALAS_DA_VITRINE: Record<IdDaPessoa, string[]> = {
  joao: ["Kamehameha!", "Pode vir, eu estou pronto!"],
  ricardo: ["Galick Gun!", "Prepare-se, eu vou com tudo!"],
  luan: ["Estou de olho em vocês."],
};

/** Repouso da batalha: uma fala por reprodução, em rodízio. */
export const FALAS_DO_REPOUSO: { id: IdDaPessoa; texto: string }[] = [
  { id: "joao", texto: "Isso foi só o aquecimento!" },
  { id: "ricardo", texto: "Eu não vou perder pra você!" },
  { id: "luan", texto: "Vocês ainda têm muito a aprender." },
];

export const FALA_DO_DRAGAO: { locutor: string; cauda: Cauda; texto: string } = { locutor: "Dragão", cauda: "centro", texto: "Quem me despertou?" };

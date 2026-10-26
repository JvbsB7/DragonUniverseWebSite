// Ataques de ki da vitrine (D42): ao selecionar JvbsBR ou rvmm255 na 1ª fala (o grito do golpe) há carga + disparo do raio, na cor
// da aura (D31), para fora da composição; na 2ª fala (a frase) fica só a guarda. Sem raio com movimento reduzido.
// `clipe`: nome do clipe da Forja; enquanto o clipe novo não existe, a cena usa `carregarKi` no lugar (ver `clipeDoAtaque`).
import { CLIPES, type Clipe } from "@/lib/personagens";
import type { IdDaPessoa } from "@/config/equipe";

export type IdDoCombatente = "joao" | "ricardo";
export type Ataque = {
  nome: string;
  clipe: "kamehameha" | "galickGun";
  /** Duração total do ataque em segundos (carga + disparo + dissipação). */
  duracao: number;
  /** Instante (s) em que o raio sai. */
  disparo: number;
  /** Sentido do raio no palco: -1 para a esquerda, +1 para a direita (sempre para fora, longe dos outros). */
  sentido: -1 | 1;
};

export const ATAQUES: Record<IdDoCombatente, Ataque> = {
  joao: { nome: "Kamehameha", clipe: "kamehameha", duracao: 2.0, disparo: 1.0, sentido: -1 },
  ricardo: { nome: "Galick Gun", clipe: "galickGun", duracao: 2.0, disparo: 1.0, sentido: 1 },
};

export const temAtaque = (id: IdDaPessoa): id is IdDoCombatente => id === "joao" || id === "ricardo";

/** Clipe do ataque: o da Forja quando existir na biblioteca; senão `carregarKi` (carga com punhos fechados) como substituto. */
export function clipeDoAtaque(id: IdDoCombatente): Clipe {
  const lib = (id === "joao" ? CLIPES.jvbsbr : CLIPES.rvmm255) as Record<string, Clipe | undefined>;
  return lib[ATAQUES[id].clipe] ?? (lib.carregarKi as Clipe);
}

"use client";

import { useMemo } from "react";
import { Personagens, type Papel } from "@/components/cinema/personagem";
import { onda, vooSuave } from "@/components/cinema/clipes-site";
import { CLIPES, type Clipe } from "@/lib/personagens";
import { DURACAO_APRESENTADOR, apresentadas, type SkinAnimation } from "@/store/skin-viewer";

// As animações da v3 (idle, walk, run, fly, wave) viram clipes no formato da Forja. Só idle, fly e wave são usadas no site;
// walk e run ficam no tipo por compatibilidade e caem no idle até haver clipe próprio.
const idle = CLIPES.jvbsbr.idle;
const clipes: Record<SkinAnimation, Clipe> = { idle, walk: idle, run: idle, fly: vooSuave, wave: onda };

// Uma apresentação por visita (movimento.md §6.2 e §8.3): o gesto dura no máximo 3 s e termina em pose estática
// (o voo termina na própria pose de voo). Quem já se apresentou só mostra a pose final.
export default function CenaApresentador({
  skin,
  animation,
  duracao = DURACAO_APRESENTADOR,
  aoPronto,
}: {
  skin: string;
  animation: SkinAnimation;
  duracao?: number;
  aoPronto: () => void;
}) {
  const chave = `${skin}|${animation}`;
  const ja = apresentadas.has(chave);
  const papeis = useMemo<Papel[]>(
    () => [{ skin, x: 0, y: 0, giro: animation === "fly" ? -0.6 : 0.35, clipe: clipes[animation], fim: animation === "fly" ? "congelar" : "repouso" }],
    [skin, animation],
  );
  return (
    <Personagens
      papeis={papeis}
      duracaoMs={ja ? 250 : duracao}
      jaApresentada={ja && animation !== "fly"}
      aoPronto={() => {
        apresentadas.add(chave);
        aoPronto();
      }}
    />
  );
}

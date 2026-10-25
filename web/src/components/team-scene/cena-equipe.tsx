"use client";

import { Personagens, type Papel } from "@/components/cinema/personagem";
import { onda, vooSuave } from "@/components/cinema/clipes-site";
import { CLIPES } from "@/lib/personagens";
import { DURACAO_CENA, apresentadas } from "@/store/skin-viewer";

// Coreografia da v3: João acena para o Ricardo, o Ricardo vira a cabeça para ele e o Luan voa ao lado.
// `?cinema-teste=bracos-cruzados` troca o voo do Luan pela pose de teste da Fase A (braços cruzados, flutuando).
const teste = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cinema-teste") === "bracos-cruzados";

const papeis: Papel[] = [
  {
    skin: "/skins/jvbs.png",
    x: -26,
    y: 0,
    giro: 0.5,
    clipe: onda,
    ajustar: (t, pose) => {
      pose.rot.head[1] += Math.sin(t * 0.6) * 0.1;
    },
  },
  {
    skin: "/skins/rvmm.png",
    x: 0,
    y: 0,
    giro: -0.2,
    clipe: CLIPES.rvmm255.idle,
    ajustar: (t, pose) => {
      pose.rot.head[1] = 0.55 + Math.sin(t * 1.3) * 0.08;
    },
  },
  {
    skin: "/skins/luan.png",
    x: 27,
    y: 6,
    giro: -0.9,
    clipe: teste ? CLIPES.luan.bracosCruzados : vooSuave,
    fim: "congelar",
    ajustar: (t, pose) => {
      pose.pos.root[1] += Math.sin(t * 1.8) * 1.5;
    },
  },
];

export default function CenaEquipe({ aoPronto }: { aoPronto: () => void }) {
  const ja = apresentadas.has("cena-equipe");
  return (
    <Personagens
      papeis={papeis}
      duracaoMs={ja ? 600 : DURACAO_CENA}
      jaApresentada={ja}
      aoPronto={() => {
        apresentadas.add("cena-equipe");
        aoPronto();
      }}
    />
  );
}

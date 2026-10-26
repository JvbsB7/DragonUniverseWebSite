"use client";

import { asset } from "@/lib/asset";
import type { IdDoCombatente } from "@/config/ataques";

// Versão leve do ataque de ki no cartão do celular (D42/D44): sem WebGL, só dois sprites da Forja animados por `steps()` de CSS dentro
// da moldura do pôster (overflow oculto): a esfera de carga (6 quadros de 160 ms, segura o último) e, em 1,00 s, o raio (7 quadros em
// 0,9 s) saindo das mãos para fora do personagem. Nunca cobre botões ou texto (fica dentro do pôster). Sem movimento reduzido.
// Posição da boca (fração do pôster) e lado: medidos a partir dos pôsteres de corpo inteiro.
const BOCA: Record<IdDoCombatente, { x: number; y: number; lado: -1 | 1; cor: "roxo" | "azul" }> = {
  joao: { x: 0.4, y: 0.49, lado: -1, cor: "roxo" },
  ricardo: { x: 0.56, y: 0.5, lado: 1, cor: "azul" },
};

const sprite = (nome: string) => `image-set(url(${asset(`/img/raio/${nome}-1x.webp`)}) 1x, url(${asset(`/img/raio/${nome}-2x.webp`)}) 2x)`;

export function RaioDoCartao({ id }: { id: IdDoCombatente }) {
  const b = BOCA[id];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="raio-orbe absolute"
        style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: "24%", aspectRatio: "1", backgroundImage: sprite(`orbe-${b.cor}`) }}
      />
      <div
        className="raio-feixe absolute"
        style={{
          left: `${b.x * 100}%`,
          top: `${b.y * 100}%`,
          width: "80%",
          aspectRatio: "240 / 48",
          backgroundImage: sprite(`raio-${b.cor}`),
          transform: `translateY(-49%) scaleX(${b.lado})`,
          transformOrigin: "0 50%",
        }}
      />
    </div>
  );
}

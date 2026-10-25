import Link from "next/link";
import type { Metadata } from "next";
import { LinkButton } from "@/components/button";
import { asset } from "@/lib/asset";
import { urlPath } from "@/lib/seo";

// Redirect estático (GitHub Pages não faz redirect no servidor e o `output: "export"` não aceita `redirects()`):
// a raça que se chamava "Demônio" agora é Glind. A página antiga leva para a nova por <meta refresh> e por um link manual.
const destino = "/wiki/racas/glind";

export const metadata: Metadata = {
  title: { absolute: "Esta página mudou: Glind | Dragon Universe" },
  description: "Esta página mudou de endereço. A raça agora está em Glind.",
  alternates: { canonical: urlPath(destino) },
  robots: { index: false, follow: true },
};

export default function DemonioRedireciona() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${asset(urlPath(destino))}`} />
      <div className="du-container flex flex-col items-start gap-5 py-16">
        <h1>Esta página mudou: Glind</h1>
        <p className="max-w-[65ch]">
          A raça que aparecia aqui agora se chama <strong>Glind</strong>. Se você não foi levado para a nova página, use o link abaixo.
        </p>
        <LinkButton href={destino} variant="primary">
          Ir para o Glind
        </LinkButton>
        <p>
          <Link href="/wiki/racas" className="du-text-link">
            Ver todas as raças
          </Link>
        </p>
      </div>
    </>
  );
}

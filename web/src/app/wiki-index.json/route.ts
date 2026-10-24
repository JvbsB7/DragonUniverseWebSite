import { buildSearchIndex } from "@/lib/wiki";

// Índice de busca da wiki gerado no build e servido como arquivo estático (out/wiki-index.json).
// A /wiki o baixa só quando a pessoa foca a busca ou usa um filtro, em vez de embuti-lo no HTML.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}

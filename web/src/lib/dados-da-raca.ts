import { getPage } from "@/lib/wiki";

// Dados do "Leitor de dados" (v4-03 §10; copy v4-04 §5): lidos da própria página da raça na wiki, no build. Nada é digitado aqui:
// bônus (multiplicadores), habilidades iniciais e formas com nível mínimo. Campo ausente = omitido; nunca nível de poder.
export type DadosDaRaca = {
  bonus: string[];
  habilidades: string | null;
  formas: { nome: string; nivel: number | null }[];
};

const limpa = (s: string) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function secao(body: string, titulo: string): string[] {
  const linhas = body.split("\n");
  const i = linhas.findIndex((l) => l.trim() === `## ${titulo}`);
  if (i < 0) return [];
  const out: string[] = [];
  for (const l of linhas.slice(i + 1)) {
    if (/^##\s/.test(l)) break;
    out.push(l);
  }
  return out;
}

export function dadosDaRaca(wikiSlug: string): DadosDaRaca | null {
  const pagina = getPage("racas", wikiSlug);
  if (!pagina) return null;
  const bonus: string[] = [];
  let habilidades: string | null = null;
  for (const l of secao(pagina.body, "Bônus da raça")) {
    const m = l.match(/^- \*\*(.+?):\*\*\s*(.+)$/);
    if (!m) continue;
    const rotulo = limpa(m[1]);
    const valor = limpa(m[2]).replace(/\.$/, "");
    if (/^Atributos$/i.test(rotulo)) bonus.push(valor.charAt(0).toUpperCase() + valor.slice(1) + ".");
    else if (/^Habilidades? inicia(l|is)$/i.test(rotulo)) habilidades = valor;
  }
  // Só a lista numerada principal (até a primeira subseção "###"): nome e nível mínimo.
  const formas: DadosDaRaca["formas"] = [];
  for (const l of secao(pagina.body, "Formas")) {
    if (/^###\s/.test(l)) break;
    const m = l.match(/^\d+\.\s+\*\*(.+?):\*\*\s*(.*)$/);
    if (!m) continue;
    const n = m[2].match(/n[ií]vel (\d+)/i);
    formas.push({ nome: limpa(m[1]), nivel: n ? Number(n[1]) : null });
  }
  if (!bonus.length && !habilidades && !formas.length) return null;
  return { bonus, habilidades, formas };
}

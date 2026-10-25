import type { WikiPage } from "./wiki-types";

// Trechos de uma página da wiki para painéis e cartões (só no servidor, no build). Texto simples, sem marcação.
const plano = (s: string) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();

export function secoes(body: string): { titulo: string; texto: string }[] {
  const out: { titulo: string; texto: string }[] = [];
  let atual: { titulo: string; linhas: string[] } | null = null;
  for (const linha of body.split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(linha);
    if (m) {
      if (atual) out.push({ titulo: atual.titulo, texto: plano(atual.linhas.join("\n").split(/\n\s*\n/)[0] ?? "") });
      atual = { titulo: plano(m[1]), linhas: [] };
    } else if (atual) atual.linhas.push(linha);
  }
  if (atual) out.push({ titulo: atual.titulo, texto: plano(atual.linhas.join("\n").trim().split(/\n\s*\n/)[0] ?? "") });
  return out;
}

const aConfirmar = (t: string) => /confirmar/i.test(t);

/** Primeiro parágrafo da primeira seção ("O que é" ou equivalente). */
export function resumo(page: WikiPage): string {
  return secoes(page.body).find((s) => s.texto)?.texto ?? page.description;
}

/** "Quem usa", só quando a wiki afirma (nunca "a confirmar"). */
export function quemUsa(page: WikiPage): string | null {
  const s = secoes(page.body).find((x) => /^quem usa/i.test(x.titulo));
  return s && s.texto && !aConfirmar(s.texto) ? s.texto : null;
}

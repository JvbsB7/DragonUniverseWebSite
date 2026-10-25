// Aviso de descontinuação do three 0.186 que não é nosso: `THREE.Clock` ainda é usado por @react-three/fiber e pelo
// skinview3d (os dois mantêm o Clock até migrarem para THREE.Timer). Só esta mensagem exata é descartada, e só nos
// módulos 3D carregados sob demanda; qualquer outro aviso continua aparecendo. Remover quando as duas bibliotecas migrarem.
const MENSAGEM = "THREE.Clock: This module has been deprecated";

export function silenciarAvisoDoClock() {
  const w = console.warn as typeof console.warn & { __clockSilenciado?: boolean };
  if (w.__clockSilenciado) return;
  const original = console.warn.bind(console);
  const novo = ((...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith(MENSAGEM)) return;
    original(...args);
  }) as typeof console.warn & { __clockSilenciado?: boolean };
  novo.__clockSilenciado = true;
  console.warn = novo;
}

/**
 * skinview3d 3.4.2 foi feito para o three 0.156 e, em `dispose()`, chama `fxaaPass.fsQuad.dispose()`. No three 0.186 o
 * ShaderPass guarda esse objeto em `_fsQuad`, e o `dispose()` quebra com "Cannot read properties of undefined". Esta função
 * recoloca o nome antigo apontando para o objeto real e só então libera o viewer (o que garante a liberação completa).
 */
export function liberarViewer(v: { dispose: () => void }) {
  const passe = (v as unknown as { fxaaPass?: { fsQuad?: unknown; _fsQuad?: unknown } }).fxaaPass;
  if (passe && !passe.fsQuad) passe.fsQuad = passe._fsQuad ?? { dispose() {} };
  try {
    v.dispose();
  } catch (e) {
    console.warn("Falha ao liberar o viewer 3D:", e);
  }
}

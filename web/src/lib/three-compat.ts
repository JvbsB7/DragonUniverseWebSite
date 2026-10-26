// Aviso de descontinuação do three 0.186 que não é nosso: `THREE.Clock` ainda é usado por dentro do @react-three/fiber
// (que mantém o Clock até migrar para THREE.Timer). Só esta mensagem exata é descartada, e só nos
// módulos 3D carregados sob demanda; qualquer outro aviso continua aparecendo. Remover quando a biblioteca migrar.
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

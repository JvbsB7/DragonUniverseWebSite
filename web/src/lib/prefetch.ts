// Rotas cujo payload carrega mídia de alta prioridade (preload do hero da home, do João na /equipe).
// Sem prefetch, o navegador só baixa essa mídia quando a pessoa realmente abre a página (QA M2 e R4-B1).
const semPrefetch = new Set(["/", "/equipe"]);

export const prefetchFor = (href: string): false | undefined => (semPrefetch.has(href) ? false : undefined);

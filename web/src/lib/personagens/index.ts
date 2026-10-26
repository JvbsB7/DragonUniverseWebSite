export * from './tipos';
export { amostrar, misturar, espelhar, eventosEntre, poseNeutra, SUAVIZACOES } from './nucleo';
// `criarAdaptador` (que importa o three) NÃO é reexportado aqui: este índice entra no JS inicial via config/ataques.ts.
// Quem precisa dele importa de '@/lib/personagens/adaptador-skinview' (só código 3D, carregado sob demanda).
export type { PlayerLike } from './adaptador-skinview';
export { CLIPES, SKINS, type IdPersonagem } from './clipes';

// Formato de dados dos clipes. Ossos = nomes do PlayerObject/SkinObject do skinview3d (player.skin.head, .body, ...).
// Convenções (personagem olha para +Z; unidade = 1 px de skin; ângulos em radianos; ordem de Euler 'YXZ'):
//  - rotação X negativa = braço/perna para a FRENTE; X positiva no tronco/raiz = inclina para a frente;
//  - braço direito (x<0): Z negativa = para FORA, Y positiva = para DENTRO (cruza o corpo); braço esquerdo: sinais invertidos;
//  - 'body' é o TRONCO: sua rotação/posição leva junto cabeça e braços (no skinview3d esses ossos são irmãos; o adaptador emula o pai);
//  - 'root' = o PlayerObject inteiro (inclinação de voo, flutuar, saltos), somado à posição que a cena já deu a ele.
export type Osso = 'root' | 'body' | 'head' | 'rightArm' | 'leftArm' | 'rightLeg' | 'leftLeg';
export const OSSOS: readonly Osso[] = ['root', 'body', 'head', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
export type Vec3 = [number, number, number];
export type Suavizacao = 'linear' | 'suave' | 'entra' | 'sai' | 'entraSai' | 'mola' | 'degrau';
// Cada osso/canal tem a sua própria linha do tempo: osso ausente numa chave MANTÉM o valor anterior.
// 'ease' vale para o trecho que CHEGA nesta chave.
export type Chave = { t: number; ease?: Suavizacao; rot?: Partial<Record<Osso, Vec3>>; pos?: Partial<Record<Osso, Vec3>> };
export type Evento = { t: number; nome: string }; // marcadores para sincronizar efeitos (impacto, pulso de ki...)
export type Clipe = {
  nome: string;
  duracao: number; // s
  loop: boolean; // loop: primeira e última chave devem coincidir; sem loop, o quadro final se mantém
  vista?: 'tres-quartos' | 'lado'; // vista sugerida para conferir na folha de contato
  chaves: Chave[];
  eventos?: Evento[];
  nota?: string;
};
export type Pose = { rot: Record<Osso, Vec3>; pos: Record<Osso, Vec3> };

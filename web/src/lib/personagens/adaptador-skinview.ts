// Aplica uma Pose a um PlayerObject do skinview3d (dentro de qualquer renderer, inclusive o canvas R3F compartilhado).
// No skinview3d, head/body/arms/legs são IRMÃOS sob player.skin; aqui o tronco ('body') faz papel de pai de cabeça e braços
// compondo a matriz do tronco (pivô no quadril) com a pose local de cada um. Só altera position/quaternion dos ossos
// e a posição/rotação do PlayerObject (somada à base que a cena definiu). Camadas externas acompanham (são filhas do osso).
import { Euler, Matrix4, Quaternion, Vector3, type Group, type Object3D } from 'three';
import type { Osso, Pose } from './tipos';

export type PlayerLike = Group & { skin: Group & Record<'head' | 'body' | 'rightArm' | 'leftArm' | 'rightLeg' | 'leftLeg', Object3D> };
const QUADRIL_Y = -12; // pivô do tronco no espaço de player.skin (mesmo das pernas)
const ORDEM = 'YXZ' as const;
const _e = new Euler(), _q = new Quaternion(), _m = new Matrix4(), _t = new Matrix4(), _tronco = new Matrix4(), _l = new Matrix4(), _v = new Vector3(), _one = new Vector3(1, 1, 1);

export function criarAdaptador(player: PlayerLike) {
  const s = player.skin;
  const partes: Record<Exclude<Osso, 'root'>, Object3D> = { body: s.body, head: s.head, rightArm: s.rightArm, leftArm: s.leftArm, rightLeg: s.rightLeg, leftLeg: s.leftLeg };
  // Repouso lido do próprio modelo (clássico e slim têm pivôs diferentes); chame com o skin.modelType já definido.
  const repouso = Object.fromEntries(Object.entries(partes).map(([n, o]) => [n, o.position.clone()])) as Record<string, Vector3>;
  const base = player.position.clone();
  const baseRot = player.rotation.clone();
  const composto = (osso: Exclude<Osso, 'root'>, p: Pose, sobTronco: boolean) => {
    const rot = p.rot[osso], pos = p.pos[osso];
    _q.setFromEuler(_e.set(rot[0], rot[1], rot[2], ORDEM));
    _l.compose(_v.set(repouso[osso].x + pos[0], repouso[osso].y + pos[1], repouso[osso].z + pos[2]), _q, _one);
    if (sobTronco) _l.premultiply(_tronco);
    _l.decompose(partes[osso].position, partes[osso].quaternion, _v);
  };
  return {
    /** Define a posição/rotação-base do personagem na cena (o clipe soma por cima). */
    definirBase(pos: Vector3, rotY = 0) { base.copy(pos); baseRot.set(0, rotY, 0, ORDEM); },
    aplicar(p: Pose) {
      // matriz do tronco: T(posição do tronco) · T(quadril) · R(tronco) · T(-quadril)
      _q.setFromEuler(_e.set(p.rot.body[0], p.rot.body[1], p.rot.body[2], ORDEM));
      _tronco.makeTranslation(p.pos.body[0], p.pos.body[1], p.pos.body[2])
        .multiply(_t.makeTranslation(0, QUADRIL_Y, 0)).multiply(_m.makeRotationFromQuaternion(_q)).multiply(_t.makeTranslation(0, -QUADRIL_Y, 0));
      // corpo: só a matriz do tronco sobre o repouso (a rotação já está em _tronco)
      _l.makeTranslation(repouso.body.x, repouso.body.y, repouso.body.z).premultiply(_tronco);
      _l.decompose(partes.body.position, partes.body.quaternion, _v);
      for (const o of ['head', 'rightArm', 'leftArm'] as const) composto(o, p, true);
      for (const o of ['rightLeg', 'leftLeg'] as const) composto(o, p, false);
      // raiz: rotação em ordem YXZ somada à base
      player.rotation.set(baseRot.x + p.rot.root[0], baseRot.y + p.rot.root[1], baseRot.z + p.rot.root[2], ORDEM);
      player.position.set(base.x + p.pos.root[0], base.y + p.pos.root[1], base.z + p.pos.root[2]);
    },
  };
}

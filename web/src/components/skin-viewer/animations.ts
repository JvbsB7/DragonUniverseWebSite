import { FlyingAnimation, FunctionAnimation, type PlayerAnimation } from "skinview3d";

// Voo no estilo Dragon Ball: tronco inclinado para a frente, não deitado como o elytra do Minecraft.
const FLY_TILT = 0.55;

export function dragonBallFlight(): PlayerAnimation {
  const flight = new FlyingAnimation();
  return new FunctionAnimation((player, _progress, delta) => {
    flight.update(player, delta);
    player.rotation.x = FLY_TILT;
  });
}

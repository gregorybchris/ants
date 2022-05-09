import Ant from "./ant";
import { World } from "./world";
import { randRange } from "../math/random-math";

export const generateWorld = (world: World): World => {
  const numAnts = 100;
  const ants: Ant[] = [];
  for (let i = 0; i < numAnts; i++) {
    const position = {
      x: (world.bounds.x.min + world.bounds.x.max) / 2,
      y: (world.bounds.y.min + world.bounds.y.max) / 2,
    };
    const ant = {
      size: 10,
      position,
      theta: randRange(0, 2 * Math.PI),
      speed: randRange(0, 10),
      omega: 0,
    };
    ants.push(ant);
  }
  return { ...world, ants };
};

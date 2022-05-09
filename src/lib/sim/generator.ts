import Ant from "./ant";
import Nutrient from "./nutrient";
import { World } from "./world";
import { randRange } from "../math/random-math";

export const generateWorld = (world: World): World => {
  const numAnts = 100;
  const ants: Ant[] = [];
  for (let i = 0; i < numAnts; i++) {
    const position = { x: 0, y: 0 };
    ants.push({
      size: 10,
      position,
      theta: randRange(0, 2 * Math.PI),
      speed: randRange(0, 10),
      omega: 0,
    });
  }

  const numNutrients = 10;
  const nutrients: Nutrient[] = [];
  for (let i = 0; i < numNutrients; i++) {
    const position = { x: 100 + randRange(0, 20), y: randRange(0, 20) };
    nutrients.push({
      position,
    });
  }

  return { ...world, ants, nutrients };
};

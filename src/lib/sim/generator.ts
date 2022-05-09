import Ant from "./ant";
import Nutrient from "./nutrient";
import PointRange from "../data/point-range";
import Random from "../math/random";
import { World } from "./world";

export const emptyWorld = (bounds: PointRange) => {
  return {
    bounds,
    ants: [],
    nutrients: [],
    pheromones: [],
  };
};

export const generateWorld = (world: World): World => {
  const random = new Random(0);

  const numAnts = 100;
  const ants: Ant[] = [];
  for (let i = 0; i < numAnts; i++) {
    const position = { x: 0, y: 0 };
    ants.push({
      id: crypto.randomUUID(),
      size: 10,
      position,
      theta: random.next(0, 2 * Math.PI),
      speed: random.next(0, 10),
      omega: 0,
      carrying: false,
    });
  }

  const numNutrients = 30;
  const nutrients: Nutrient[] = [];
  for (let i = 0; i < numNutrients; i++) {
    const position = { x: 100 + random.next(0, 20), y: 50 + random.next(0, 20) };
    nutrients.push({
      id: crypto.randomUUID(),
      position,
    });
  }

  return { ...world, ants, nutrients };
};

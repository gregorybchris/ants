import Ant from "./ant";
import Nest from "./nest";
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
    nests: [],
  };
};

export const generateWorld = (world: World): World => {
  const random = new Random(0);

  // Generate ants
  const numNests = 3;
  const nests: Nest[] = [];
  const ants: Ant[] = [];
  for (let i = 0; i < numNests; i++) {
    const x = random.next(world.bounds.x.min, world.bounds.x.max);
    const y = random.next(world.bounds.y.min, world.bounds.y.max);
    const position = { x, y };
    const nest = {
      id: crypto.randomUUID(),
      position,
    };
    nests.push(nest);

    const numAntsPerNest = 50;
    for (let i = 0; i < numAntsPerNest; i++) {
      ants.push({
        id: crypto.randomUUID(),
        size: 10,
        position: nest.position,
        theta: random.next(0, 2 * Math.PI),
        speed: random.next(0, 10),
        omega: 0,
        carrying: false,
      });
    }
  }

  // Generate nutrients
  const numNutrientClusters = 3;
  const numNutrientsPerCluster = 30;
  const nutrients: Nutrient[] = [];
  for (let i = 0; i < numNutrientClusters; i++) {
    const clusterX = random.next(world.bounds.x.min, world.bounds.x.max);
    const clusterY = random.next(world.bounds.y.min, world.bounds.y.max);
    const clusterPosition = { x: clusterX, y: clusterY };
    for (let j = 0; j < numNutrientsPerCluster; j++) {
      const x = clusterPosition.x + random.next(-15, 15);
      const y = clusterPosition.y + random.next(-15, 15);
      const position = { x, y };
      nutrients.push({
        id: crypto.randomUUID(),
        position,
      });
    }
  }

  return { ...world, ants, nutrients, nests };
};

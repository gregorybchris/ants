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
  const random = new Random(6);

  // Generate ants
  const numNests = 1;
  const numAntsPerNest = 40;
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

    const sightAngle = Math.PI / 3;
    const sightDistance = 80;
    const senseDistance = 30;
    for (let j = 0; j < numAntsPerNest; j++) {
      ants.push({
        id: crypto.randomUUID(),
        size: 10,
        position,
        theta: random.next(0, 2 * Math.PI),
        speed: 3,
        carrying: false,
        certainty: 1.0,
        discounting: 0.004,
        sightAngle,
        sightDistance,
        senseDistance,
      });
    }
  }

  // ants[13].id = "chosen";

  // Generate nutrients
  const numNutrientClusters = 4;
  const numNutrientsPerCluster = 100;
  const clusterRadius = 30;
  const nutrients: Nutrient[] = [];
  for (let i = 0; i < numNutrientClusters; i++) {
    const clusterX = random.next(world.bounds.x.min, world.bounds.x.max);
    const clusterY = random.next(world.bounds.y.min, world.bounds.y.max);
    const clusterPosition = { x: clusterX, y: clusterY };
    for (let j = 0; j < numNutrientsPerCluster; j++) {
      const angle = random.next(0, Math.PI * 2);
      const radius = random.next(0, clusterRadius);
      const x = clusterPosition.x + Math.cos(angle) * radius;
      const y = clusterPosition.y + Math.sin(angle) * radius;
      const position = { x, y };
      nutrients.push({
        id: crypto.randomUUID(),
        position,
      });
    }
  }

  return { ...world, ants, nutrients, nests };
};

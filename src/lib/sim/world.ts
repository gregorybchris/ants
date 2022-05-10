import Ant from "./ant";
import Nest from "./nest";
import Nutrient from "./nutrient";
import Pheromone from "./pheromone";
import Point from "../data/point";
import PointRange from "../data/point-range";

export interface World {
  bounds: PointRange;
  ants: Ant[];
  nutrients: Nutrient[];
  pheromones: Pheromone[];
  nests: Nest[];
}

export const inWorldBounds = (position: Point, world: World): boolean => {
  if (position.x < world.bounds.x.min) return false;
  else if (position.x > world.bounds.x.max) return false;
  else if (position.y < world.bounds.y.min) return false;
  else if (position.y > world.bounds.y.max) return false;
  return true;
};

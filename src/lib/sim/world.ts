import Ant from "./ant";
import Nutrient from "./nutrient";
import Point from "../data/point";
import PointRange from "../data/point-range";

export interface World {
  bounds: PointRange;
  ants: Ant[];
  nutrients: Nutrient[];
}

export const inWorldBounds = (position: Point, world: World): boolean => {
  if (position.x < world.bounds.x.min) return false;
  if (position.x > world.bounds.x.max) return false;
  if (position.y < world.bounds.y.min) return false;
  if (position.y > world.bounds.y.max) return false;
  return true;
};

export const search = (world: World, position: Point, distance: number): Ant[] => {
  // Search tree for ants within a distance from a given point
  return [];
};

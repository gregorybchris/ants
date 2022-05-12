import Entity from "./entity";
import Point from "../data/point";

export interface Pheromone extends Entity {
  type: PheromoneType;
  strength: number;
  decay: number;
}

export enum PheromoneType {
  ALPHA = "alpha",
  BETA = "beta",
  GAMMA = "gamma",
  DELTA = "delta",
}

export const createPheromone = (type: PheromoneType, position: Point, strength: number): Pheromone => {
  const decay = 0.002;
  const id = crypto.randomUUID();
  return { id, strength, position, type, decay };
};

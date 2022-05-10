import Entity from "./entity";
import { PheromoneType } from "./pheromone-type";

export default interface Pheromone extends Entity {
  type: PheromoneType;
  strength: number;
  decay: number;
}

import Entity from "./entity";

export default interface Ant extends Entity {
  size: number;
  theta: number;
  speed: number;
  carrying: boolean;
  certainty: number;
  discounting: number;
  sightAngle: number;
  sightDistance: number;
  senseDistance: number;
}

import Entity from "./entity";

export default interface Ant extends Entity {
  size: number;
  theta: number;
  speed: number;
  omega: number;
  carrying: boolean;
  sightAngle: number;
  sightDistance: number;
}

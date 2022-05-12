import Entity from "./entity";
import Range from "../data/range";

export default interface Ant extends Entity {
  size: number;
  theta: number;
  speed: number;
  carrying: boolean;
  certainty: number;
  discounting: number;
  sightAngle: number;
  sightDistance: number;
  senseRange: Range;
  touchDistance: number;
}

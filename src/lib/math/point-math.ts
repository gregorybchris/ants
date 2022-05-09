import Point from "../data/point";
import PointRange from "../data/point-range";
import { clipScaler } from "./vector-math";

export const clipPoint = (point: Point, pointRange: PointRange): Point => {
  return {
    x: clipScaler(point.x, pointRange.x),
    y: clipScaler(point.y, pointRange.y),
  };
};

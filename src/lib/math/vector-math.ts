import Point from "../data/point";
import PointRange from "../data/point-range";
import Range from "../data/range";

export const clipScalar = (scalar: number, range: Range) => {
  return Math.max(Math.min(scalar, range.max), range.min);
};

export const scaleScalar = (scalar: number, fromRange: Range, toRange: Range): number => {
  const inter = (scalar - fromRange.min) / (fromRange.max - fromRange.min);
  return inter * (toRange.max - toRange.min) + toRange.min;
};

export const scalePoint = (point: Point, fromRange: PointRange, toRange: PointRange): Point => {
  return {
    x: scaleScalar(point.x, fromRange.x, toRange.x),
    y: scaleScalar(point.y, fromRange.y, toRange.y),
  };
};

export const wrapScalar = (scalar: number, range: Range) => {
  const interval = range.max - range.min;
  while (scalar < range.min) {
    scalar += interval;
  }
  while (scalar > range.max) {
    scalar -= interval;
  }
  return scalar;
};

export const wrapPoint = (point: Point, pointRange: PointRange): Point => {
  return {
    x: wrapScalar(point.x, pointRange.x),
    y: wrapScalar(point.y, pointRange.y),
  };
};

export const getDist = (pointA: Point, pointB: Point): number => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getDirection = (pointA: Point, pointB: Point): number => {
  return Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
};

export const getTurnAngle = (theta: number, direction: number): number => {
  return Math.atan2(Math.sin(theta - direction), Math.cos(theta - direction));
};

export const getTurnSign = (theta: number, direction: number): number => {
  return Math.sign(getTurnAngle(theta, direction));
};

export const scalarInRange = (scalar: number, range: Range): boolean => {
  return scalar >= range.min && scalar <= range.max;
};

export const pointInRange = (point: Point, range: PointRange): boolean => {
  return scalarInRange(point.x, range.x) && scalarInRange(point.y, range.y);
};

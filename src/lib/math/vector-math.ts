import Point from "../data/point";
import PointRange from "../data/point-range";
import Range from "../data/range";
import Vector from "../data/vector";

export const rotate = (vector: Vector, theta: number): Vector => {
  const x = vector.x * Math.cos(theta) - vector.y * Math.sin(theta);
  const y = vector.x * Math.sin(theta) + vector.y * Math.cos(theta);
  return { x, y };
};

export const clipScaler = (scaler: number, range: Range) => {
  return Math.max(Math.min(scaler, range.max), range.min);
};

export const wrapScaler = (scaler: number, range: Range) => {
  const interval = range.max - range.min;
  while (scaler < range.min) {
    scaler += interval;
  }
  while (scaler > range.max) {
    scaler -= interval;
  }
  return scaler;
};

export const clipMagnitude = (vector: Vector, range: Range) => {
  const oldMagnitude = Math.sqrt(vector.x * vector.x + vector.y + vector.y);
  const newMagnitude = clipScaler(oldMagnitude, range);
  return scale(vector, newMagnitude / oldMagnitude);
};

export const scale = (vector: Vector, factor: number) => {
  return {
    x: vector.x * factor,
    y: vector.y * factor,
  };
};

export const clipPoint = (point: Point, pointRange: PointRange): Point => {
  return {
    x: clipScaler(point.x, pointRange.x),
    y: clipScaler(point.y, pointRange.y),
  };
};

export const wrapPoint = (point: Point, pointRange: PointRange): Point => {
  return {
    x: wrapScaler(point.x, pointRange.x),
    y: wrapScaler(point.y, pointRange.y),
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

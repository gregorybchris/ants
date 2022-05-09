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

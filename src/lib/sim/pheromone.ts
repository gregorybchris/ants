import { getDist, scalarInRange, scalePoint, scaleScalar } from "../math/vector-math";

import Entity from "./entity";
import Point from "../data/point";
import PointRange from "../data/point-range";
import Range from "../data/range";

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

export interface PheromoneGrid {
  rows: number;
  cols: number;
  cells: Pheromone[][][];
  bounds: PointRange;
}

export const createGrid = (rows: number, cols: number, bounds: PointRange): PheromoneGrid => {
  const cells = Array(rows).fill(Array(cols).fill([]));
  return {
    rows,
    cols,
    cells,
    bounds,
  };
};

const getGridCoords = (grid: PheromoneGrid, point: Point): { row: number; col: number } => {
  const gridRange = { x: { min: 0, max: grid.cols }, y: { min: 0, max: grid.rows } };
  const gridPoint = scalePoint(point, grid.bounds, gridRange);
  return {
    row: Math.floor(gridPoint.y),
    col: Math.floor(gridPoint.x),
  };
};

export const addToGrid = (grid: PheromoneGrid, pheromones: Pheromone[]): PheromoneGrid => {
  pheromones.forEach((pheromone: Pheromone) => {
    const { row, col } = getGridCoords(grid, pheromone.position);
    grid.cells[row][col].push(pheromone);
  });
  return grid;
};

export const gridForEach = (grid: PheromoneGrid, callback: (pheromone: Pheromone) => void) => {
  grid.cells.forEach((row) => {
    row.forEach((col) => {
      col.forEach((pheromone: Pheromone) => {
        callback(pheromone);
      });
    });
  });
};

export const mapGrid = (grid: PheromoneGrid, callback: (pheromone: Pheromone) => Pheromone): PheromoneGrid => {
  const cells = grid.cells.map((row) => {
    return row.map((collection) => {
      return collection.map((pheromone: Pheromone) => {
        return callback(pheromone);
      });
    });
  });
  return { ...grid, cells };
};

export const gridForEachSearch = (
  grid: PheromoneGrid,
  point: Point,
  range: Range,
  callback: (pheromone: Pheromone) => void
) => {
  // gridForEach(grid, (pheromone: Pheromone) => {
  //   const pheromoneDist = getDist(point, pheromone.position);
  //   if (scalarInRange(pheromoneDist, range)) {
  //     callback(pheromone);
  //   }
  // });

  const { row, col } = getGridCoords(grid, point);
  grid.cells[row][col].forEach((pheromone: Pheromone) => {
    const pheromoneDist = getDist(point, pheromone.position);
    if (scalarInRange(pheromoneDist, range)) {
      callback(pheromone);
    }
  });
};

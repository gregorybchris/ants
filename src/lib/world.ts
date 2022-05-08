import Ant from "./ant";
import Point from "./point";
import PointRange from "./point-range";

class World {
  bounds: PointRange;
  ants: Ant[];

  constructor(bounds: PointRange) {
    this.bounds = bounds;
    this.ants = [];
  }

  forEachAnt(callback: (ant: Ant) => void) {
    this.ants.forEach(callback);
  }

  inBounds(position: Point): boolean {
    if (position.x < this.bounds.x.min) return false;
    if (position.x > this.bounds.x.max) return false;
    if (position.y < this.bounds.y.min) return false;
    if (position.y > this.bounds.y.max) return false;
    return true;
  }

  search(position: Point, distance: number): Ant[] {
    // Search tree for ants within a distance from a given point
    return [];
  }

  addAnt(ant: Ant) {
    this.ants.push(ant);
  }
}

export default World;

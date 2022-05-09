import Entity from "./entity";
import Point from "../data/point";
import PointRange from "../data/point-range";

class World {
  bounds: PointRange;
  entities: Entity[];

  constructor(bounds: PointRange) {
    this.bounds = bounds;
    this.entities = [];
  }

  forEachEntity(callback: (entity: Entity) => void) {
    this.entities.forEach(callback);
  }

  inBounds(position: Point): boolean {
    if (position.x < this.bounds.x.min) return false;
    if (position.x > this.bounds.x.max) return false;
    if (position.y < this.bounds.y.min) return false;
    if (position.y > this.bounds.y.max) return false;
    return true;
  }

  search(position: Point, distance: number): Entity[] {
    // Search tree for entities within a distance from a given point
    return [];
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }
}

export default World;

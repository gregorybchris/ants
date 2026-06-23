import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { Pheromone, PheromoneType, createPheromone } from "../../lib/sim/pheromone";
import { clipScalar, getDirection, getDist, getTurnAngle, scalarInRange, wrapPoint } from "../../lib/math/vector-math";
import { emptyWorld, generateWorld } from "../../lib/sim/generator";
import { useEffect, useState } from "react";

import Ant from "../../lib/sim/ant";
import Nest from "../../lib/sim/nest";
import Nutrient from "../../lib/sim/nutrient";
import Point from "../../lib/data/point";
import PointRange from "../../lib/data/point-range";
import Random from "../../lib/math/random";
import SimGraphics from "../SimGraphics/SimGraphics";
import { World } from "../../lib/sim/world";
import { max } from "../../lib/math/math-utils";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [world, setWorld] = useState<World>(emptyWorld({ x: { min: -500, max: 500 }, y: { min: -500, max: 500 } }));
  const [viewBounds, setViewBounds] = useState<PointRange>({ x: { min: -500, max: 500 }, y: { min: -500, max: 500 } });
  const random = new Random(0);

  useEffect(() => {
    const onKeyPress = (keyName: KeyName) => {
      if (keyName == Keyboard.Keys.LETTER_P) {
        console.log(`Updating running from ${running}`);
        setRunning((prevRunning) => !prevRunning);
      }
    };
    new Keyboard(onKeyPress);
  }, []);

  useEffect(() => {
    setWorld(generateWorld);
  }, []);

  const update = (deltaTime: number) => {
    setTicks((prevTicks) => prevTicks + 1);
    setWorld((world) => updateWorld(world, deltaTime));
  };

  const updateWorld = (world: World, deltaTime: number): World => {
    let ants = world.ants;
    let pheromones = world.pheromones;
    let nutrients = world.nutrients;
    let nests = world.nests;

    // Move ants
    ants = ants.map((ant: Ant) => moveAnt(ant, nutrients, nests, pheromones, world.bounds, deltaTime));

    // Emit pheromones
    pheromones = [...pheromones, ...emitPheromones(ants)];

    // Decay pheromones
    pheromones = decayPheromones(pheromones);

    // Pick up nutrients
    nutrients = pickUpNutrients(ants, nutrients);

    // Deposit nutrients
    depositNutrients(ants, nests);

    return {
      ...world,
      ants,
      pheromones,
      nutrients,
    };
  };

  const pickUpNutrients = (ants: Ant[], nutrients: Nutrient[]): Nutrient[] => {
    const nutrientIDsToCarry: string[] = [];
    nutrients.forEach((nutrient: Nutrient) => {
      ants.forEach((ant: Ant) => {
        if (getDist(ant.position, nutrient.position) < ant.touchDistance) {
          if (!ant.carrying) {
            ant.carrying = true;
            ant.theta += Math.PI;
            nutrientIDsToCarry.push(nutrient.id);
          }
          ant.certainty = 1;
          return;
        }
      });
    });
    return nutrients.filter((nutrient) => !nutrientIDsToCarry.includes(nutrient.id));
  };

  const depositNutrients = (ants: Ant[], nests: Nest[]) => {
    nests.forEach((nest: Nest) => {
      ants.forEach((ant: Ant) => {
        if (getDist(ant.position, nest.position) < ant.touchDistance) {
          if (ant.carrying) {
            ant.carrying = false;
            ant.theta += Math.PI;
          }
          ant.certainty = 1;
        }
      });
    });
  };

  const emitPheromones = (ants: Ant[]): Pheromone[] => {
    const pheromones: Pheromone[] = [];
    ants.forEach((ant: Ant) => {
      const type = ant.carrying ? PheromoneType.BETA : PheromoneType.ALPHA;
      const strength = ant.certainty;
      const probEmit = 0.4;
      if (random.dice(1 / probEmit)) {
        pheromones.push(createPheromone(type, ant.position, strength));
      }
    });
    return pheromones;
  };

  const decayPheromones = (pheromones: Pheromone[]): Pheromone[] => {
    const minStrength = 0.001;
    const newPheromones: Pheromone[] = [];
    pheromones.forEach((pheromone: Pheromone) => {
      if (pheromone.strength < minStrength) return;
      newPheromones.push({
        ...pheromone,
        strength: pheromone.strength - pheromone.decay,
      });
    });
    return newPheromones;
  };

  const moveAnt = (
    ant: Ant,
    nutrients: Nutrient[],
    nests: Nest[],
    pheromones: Pheromone[],
    bounds: PointRange,
    deltaTime: number
  ): Ant => {
    let theta = ant.theta;
    let speed = ant.speed;
    let certainty = ant.certainty;

    // Update angle based on pheromones
    theta = getAntAngle(ant, nutrients, nests, pheromones);

    // Perturb theta for wandering
    const dThetaRandom = Math.PI / 50;
    const dTheta = random.next(-dThetaRandom, dThetaRandom);
    theta += dTheta;

    // Occasionally inject a larger random heading change ("exploration"). This
    // breaks the symmetry that makes the colony lock onto the first jagged
    // trail, so routes straighten and smooth out faster over many ticks.
    const exploreProb = 0.15;
    const exploreAngle = Math.PI / 8;
    if (random.dice(1 / exploreProb)) {
      theta += random.next(-exploreAngle, exploreAngle);
    }

    // Discount pheromones based on
    certainty = clipScalar(certainty - ant.discounting, { min: 0, max: 1 });

    // Perturb speed for realism
    const speedRange = { min: 3.5, max: 4 };
    const dSpeedRange = { min: -0.1, max: 0.1 };
    const dSpeed = random.next(dSpeedRange.min, dSpeedRange.max);
    speed = clipScalar(ant.speed + dSpeed, speedRange);

    // Update position based on velocity. Scale the step by elapsed time so an
    // ant's speed is independent of frame rate. deltaTime is normalized to a
    // 60fps frame and clamped so a long frame (e.g. after the tab was
    // backgrounded) can't teleport ants across the world.
    const targetFrameMs = 1000 / 60;
    const frameScale = clipScalar(deltaTime / targetFrameMs, { min: 0, max: 3 });
    const vx = Math.cos(theta) * speed * frameScale;
    const vy = Math.sin(theta) * speed * frameScale;
    const position = wrapPoint({ x: ant.position.x + vx, y: ant.position.y + vy }, bounds);

    return { ...ant, speed, theta, position, certainty };
  };

  const getAntAngle = (ant: Ant, nutrients: Nutrient[], nests: Nest[], pheromones: Pheromone[]) => {
    if (ant.carrying) {
      // Carrying a nutrient, try to get it back to nest
      const closestNest = findClosestNest(ant, nests);
      if (getDist(ant.position, closestNest.position) < ant.sightDistance) {
        // Head toward nearest nest to deposit nutrients
        return getDirection(ant.position, closestNest.position);
      } else {
        // Head toward alpha pheromones that indicate a nest might be close
        return getMaxPheromoneAngle(ant, pheromones, ant.position, PheromoneType.ALPHA);
      }
    }

    if (!ant.carrying) {
      // Not carrying a nutrient, try to find one to bring back to nest
      const closestNutrient = findClosestNutrient(ant, nutrients);
      if (closestNutrient !== undefined) {
        // Head toward nutrients to pick them up
        return getDirection(ant.position, closestNutrient.position);
      } else {
        // Head toward beta pheromones that indicate nutrients might be close
        return getMaxPheromoneAngle(ant, pheromones, ant.position, PheromoneType.BETA);
      }
    }

    return ant.theta;
  };

  const findClosestNutrient = (ant: Ant, nutrients: Nutrient[]): Nutrient | undefined => {
    let closestNutrient = undefined;
    if (nutrients.length > 0) {
      const compare = (a: Nutrient, b: Nutrient) =>
        getDist(b.position, ant.position) - getDist(a.position, ant.position);
      closestNutrient = max(nutrients, compare);
      if (getDist(ant.position, closestNutrient.position) > ant.sightDistance) {
        closestNutrient = undefined;
      }
    }
    return closestNutrient;
  };

  const findClosestNest = (ant: Ant, nests: Nest[]): Nest => {
    const compare = (a: Nest, b: Nest) => getDist(b.position, ant.position) - getDist(a.position, ant.position);
    return max(nests, compare);
  };

  const getMaxPheromoneAngle = (
    ant: Ant,
    pheromones: Pheromone[],
    position: Point,
    pheromoneType: PheromoneType
  ): number => {
    // Average the in-sight pheromone directions as unit vectors. Summing raw
    // angles is wrong because they wrap at 0/2π, which makes headings that
    // straddle that seam average to the opposite direction.
    let sinSum = 0;
    let cosSum = 0;
    let angleCount = 0;
    pheromones.forEach((pheromone: Pheromone) => {
      if (pheromone.type != pheromoneType) return;
      const pheromoneDist = getDist(position, pheromone.position);
      if (scalarInRange(pheromoneDist, ant.senseRange)) {
        const pheromoneAngle = getDirection(position, pheromone.position);
        const relativeAngle = getTurnAngle(ant.theta, pheromoneAngle);

        if (Math.abs(relativeAngle) < ant.sightAngle) {
          sinSum += Math.sin(pheromoneAngle);
          cosSum += Math.cos(pheromoneAngle);
          angleCount++;
        }
      }
    });

    if (angleCount == 0) return ant.theta;
    return Math.atan2(sinSum, cosSum);
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} bounds={viewBounds} running={running} world={world} />
    </div>
  );
}

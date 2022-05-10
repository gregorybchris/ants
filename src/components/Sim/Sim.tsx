import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { clipPoint, getDirection, getDist, getTurnSign } from "../../lib/math/vector-math";
import { emptyWorld, generateWorld } from "../../lib/sim/generator";
import { useEffect, useState } from "react";

import Ant from "../../lib/sim/ant";
import Nest from "../../lib/sim/nest";
import Nutrient from "../../lib/sim/nutrient";
import Pheromone from "../../lib/sim/pheromone";
import { PheromoneType } from "../../lib/sim/pheromone-type";
import PointRange from "../../lib/data/point-range";
import Random from "../../lib/math/random";
import SimGraphics from "../SimGraphics/SimGraphics";
import { World } from "../../lib/sim/world";
import { clipScaler } from "../../lib/math/vector-math";
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
    setWorld(updateWorld);
  };

  const updateWorld = (world: World): World => {
    let ants = world.ants;
    let pheromones = world.pheromones;
    let nutrients = world.nutrients;
    let nests = world.nests;

    // Move ants
    ants = ants.map((ant: Ant) => moveAnt(ant, nutrients, nests, pheromones, world.bounds));

    // Drop pheromones
    pheromones = [...pheromones, ...dropPheromones(ants)];

    // Decay pheromones
    pheromones = decayPheromones(pheromones);

    // Pick up nutrients
    nutrients = pickUpNutrients(ants, nutrients);

    // Drop off nutrients
    dropNutrients(ants, nests);

    return {
      ...world,
      ants,
      pheromones,
      nutrients,
    };
  };

  const pickUpNutrients = (ants: Ant[], nutrients: Nutrient[]): Nutrient[] => {
    const touchDistance = 5;
    const nutrientIDsToCarry: string[] = [];
    nutrients.forEach((nutrient: Nutrient) => {
      ants.forEach((ant: Ant) => {
        if (!ant.carrying && getDist(ant.position, nutrient.position) < touchDistance) {
          ant.carrying = true;
          ant.theta += Math.PI;
          nutrientIDsToCarry.push(nutrient.id);
          return;
        }
      });
    });
    return nutrients.filter((nutrient) => !nutrientIDsToCarry.includes(nutrient.id));
  };

  const dropNutrients = (ants: Ant[], nests: Nest[]) => {
    const touchDistance = 5;
    nests.forEach((nest: Nest) => {
      ants.forEach((ant: Ant) => {
        if (ant.carrying && getDist(ant.position, nest.position) < touchDistance) {
          ant.carrying = false;
          ant.theta += Math.PI;
        }
      });
    });
  };

  const dropPheromones = (ants: Ant[]): Pheromone[] => {
    const pheromones: Pheromone[] = [];
    ants.forEach((ant: Ant) => {
      const position = ant.position;
      const strength = 1;
      const id = crypto.randomUUID();
      if (!ant.carrying) {
        const decay = 0.001;
        const type = PheromoneType.ALPHA;
        if (random.dice(100)) pheromones.push({ id, strength, position, type, decay });
      } else {
        const decay = 0.001;
        const type = PheromoneType.BETA;
        if (random.dice(100)) pheromones.push({ id, strength, position, type, decay });
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
    bounds: PointRange
  ): Ant => {
    const speedRange = { min: 1, max: 2 };
    const dSpeedRange = { min: -0.1, max: 0.1 };
    const omegaRange = { min: -Math.PI / 4, max: Math.PI / 4 };
    const dOmegaRange = { min: -Math.PI / 30, max: Math.PI / 30 };

    // Add randomness for wandering
    const dOmega = random.next(dOmegaRange.min, dOmegaRange.max);
    let omega = clipScaler(ant.omega + dOmega, omegaRange);
    let theta = ant.theta + omega;

    const dSpeed = random.next(dSpeedRange.min, dSpeedRange.max);
    let speed = clipScaler(ant.speed + dSpeed, speedRange);
    const vx = Math.cos(theta) * speed;
    const vy = Math.sin(theta) * speed;
    const position = clipPoint({ x: ant.position.x + vx, y: ant.position.y + vy }, bounds);

    const antSightDist = 200;
    const antSightAngle = Math.PI;

    if (ant.carrying) {
      // Carrying a nutrient, try to get it back to nest
      const closestNest = max(nests, (a, b) => getDist(b.position, position) - getDist(a.position, position));
      if (getDist(position, closestNest.position) < antSightDist) {
        // Head toward nearest nest to drop off nutrients
        const direction = getDirection(position, closestNest.position);
        const turnSign = getTurnSign(theta, direction);
        omega = turnSign * omegaRange.max;
        speed = speedRange.max;
      } else {
        // Head toward alpha pheromones that indicate a nest might be close
        let leftCount = 0;
        let rightCount = 0;
        pheromones.forEach((pheromone: Pheromone) => {
          if (pheromone.type != PheromoneType.ALPHA) return;
          if (getDist(position, pheromone.position) < antSightDist) {
            const angle = getDirection(position, pheromone.position);
            if (angle > 0 && angle < antSightAngle) rightCount++;
            if (angle < 0 && angle > -antSightAngle) leftCount++;
          }
        });

        let turnSign = rightCount == leftCount ? 0 : rightCount > leftCount ? 1 : -1;
        const ratio = rightCount / (rightCount + leftCount);
        if (ratio > 0.45 || ratio < 0.55) turnSign = 0;
        omega = turnSign * omegaRange.max;
        speed = speedRange.max;
      }
    } else {
      // Not carrying a nutrient, try to find one to bring back to nest
      let closestNutrient = undefined;
      if (nutrients.length > 0) {
        closestNutrient = max(nutrients, (a, b) => getDist(b.position, position) - getDist(a.position, position));
        if (getDist(position, closestNutrient.position) > antSightDist) {
          closestNutrient = undefined;
        }
      }

      if (closestNutrient) {
        // Head toward nutrients to pick them up
        const direction = getDirection(position, closestNutrient.position);
        const turnSign = getTurnSign(theta, direction);
        omega = turnSign * omegaRange.max;
        speed = speedRange.max;
      } else {
        // Head toward beta pheromones that indicate nutrients might be close
        let leftCount = 0;
        let rightCount = 0;
        pheromones.forEach((pheromone: Pheromone) => {
          if (pheromone.type != PheromoneType.BETA) return;
          if (getDist(position, pheromone.position) < antSightDist) {
            const angle = getDirection(position, pheromone.position);
            if (angle > 0 && angle < antSightAngle) {
              rightCount++;
            } else if (angle < 0 && angle > -antSightAngle) {
              leftCount++;
            }
          }
        });

        let turnSign = rightCount == leftCount ? 0 : rightCount > leftCount ? 1 : -1;
        const ratio = rightCount / (rightCount + leftCount);
        if (ratio > 0.45 || ratio < 0.55) {
          turnSign = 0;
        }
        omega = turnSign * omegaRange.max;
        speed = speedRange.max;
      }
    }

    return { ...ant, omega, theta, speed, position };
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} bounds={viewBounds} running={running} world={world} />
    </div>
  );
}

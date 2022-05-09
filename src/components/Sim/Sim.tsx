import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { clipPoint, getDirection, getDist, getTurnSign } from "../../lib/math/vector-math";
import { emptyWorld, generateWorld } from "../../lib/sim/generator";
import { useEffect, useState } from "react";

import Ant from "../../lib/sim/ant";
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
    let ants = world.ants.map((ant: Ant) => moveAnt(ant, world.nutrients, world.bounds));
    let pheromones = updatePheromones([...world.pheromones, ...dropPheromones(world.ants)]);

    let nutrients = world.nutrients;

    const carryDistance = 5;
    const nutrientIDsToCarry: string[] = [];
    nutrients.forEach((nutrient: Nutrient) => {
      ants.forEach((ant: Ant) => {
        if (!ant.carrying && getDist(ant.position, nutrient.position) < carryDistance) {
          ant.carrying = true;
          nutrientIDsToCarry.push(nutrient.id);
          return;
        }
      });
    });
    nutrients = nutrients.filter((nutrient) => !nutrientIDsToCarry.includes(nutrient.id));

    return {
      ...world,
      ants,
      pheromones,
      nutrients,
    };
  };

  const dropPheromones = (ants: Ant[]): Pheromone[] => {
    const pheromones: Pheromone[] = [];
    ants.forEach((ant: Ant) => {
      const position = ant.position;
      const strength = 1;
      const id = crypto.randomUUID();
      if (!ant.carrying) {
        if (random.dice(500)) pheromones.push({ id, strength, position, type: PheromoneType.ALPHA });
      } else {
        if (random.dice(100)) pheromones.push({ id, strength, position, type: PheromoneType.BETA });
      }
    });
    return pheromones;
  };

  const updatePheromones = (pheromones: Pheromone[]): Pheromone[] => {
    const minStrength = 0.01;
    const deltaStrength = 0.001;
    const newPheromones: Pheromone[] = [];
    pheromones.forEach((pheromone: Pheromone) => {
      if (pheromone.strength < minStrength) return;
      newPheromones.push({
        ...pheromone,
        strength: pheromone.strength - deltaStrength,
      });
    });
    return newPheromones;
  };

  const moveAnt = (ant: Ant, nutrients: Nutrient[], bounds: PointRange): Ant => {
    const speedRange = { min: 0, max: 1 };
    const dSpeedRange = { min: -0.1, max: 0.1 };
    const omegaRange = { min: -Math.PI / 20, max: Math.PI / 20 };
    const dOmegaRange = { min: -Math.PI / 30, max: Math.PI / 30 };

    const dOmega = random.next(dOmegaRange.min, dOmegaRange.max);
    let omega = clipScaler(ant.omega + dOmega, omegaRange);
    const theta = ant.theta + omega;

    const dSpeed = random.next(dSpeedRange.min, dSpeedRange.max);
    let speed = clipScaler(ant.speed + dSpeed, speedRange);
    const vx = Math.cos(theta) * speed;
    const vy = Math.sin(theta) * speed;
    const position = clipPoint({ x: ant.position.x + vx, y: ant.position.y + vy }, bounds);

    if (!ant.carrying && nutrients.length > 0) {
      const antSightDist = 70;
      const closestNutrient = max(nutrients, (a, b) => getDist(b.position, position) - getDist(a.position, position));
      if (closestNutrient && getDist(closestNutrient.position, position) < antSightDist) {
        const direction = getDirection(position, closestNutrient.position);
        const turnSign = getTurnSign(theta, direction);
        omega = turnSign * dOmegaRange.max;
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

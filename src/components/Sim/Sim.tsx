import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import PointRange from "../../lib/data/point-range";
import SimGraphics from "../SimGraphics/SimGraphics";
import { World } from "../../lib/sim/world";
import { clipPoint } from "../../lib/math/point-math";
import { clipScaler } from "../../lib/math/vector-math";
import { generateWorld } from "../../lib/sim/generator";
import { randRange } from "../../lib/math/random-math";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [world, setWorld] = useState<World>({
    bounds: { x: { min: -500, max: 500 }, y: { min: -500, max: 500 } },
    ants: [],
    nutrients: [],
  });
  const [viewBounds, setViewBounds] = useState<PointRange>({ x: { min: -500, max: 500 }, y: { min: -500, max: 500 } });

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
    return { ...world, ants: world.ants.map(updateAnt) };
  };

  const updateAnt = (ant: Ant): Ant => {
    const speedRange = { min: 0, max: 1 };
    const omegaRange = { min: -Math.PI / 8, max: Math.PI / 8 };
    const dOmegaRange = { min: -Math.PI / 10, max: Math.PI / 10 };

    const omega = clipScaler(ant.omega + randRange(dOmegaRange.min, dOmegaRange.max), omegaRange);
    const theta = ant.theta + omega;
    const speed = clipScaler(ant.speed + randRange(-0.1, 0.1), speedRange);
    const vx = Math.cos(theta) * speed;
    const vy = Math.sin(theta) * speed;
    const position = clipPoint({ x: ant.position.x + vx, y: ant.position.y + vy }, world.bounds);
    return { ...ant, omega, theta, speed, position };
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} bounds={viewBounds} running={running} world={world} />
    </div>
  );
}

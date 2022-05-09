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
import { randRange } from "../../lib/math/random-math";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);
  const [world, setWorld] = useState<World>({
    bounds: { x: { min: -500, max: 500 }, y: { min: -500, max: 500 } },
    ants: [],
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
    const numAnts = 100;
    const ants: Ant[] = [];
    for (let i = 0; i < numAnts; i++) {
      const position = {
        x: (world.bounds.x.min + world.bounds.x.max) / 2,
        y: (world.bounds.y.min + world.bounds.y.max) / 2,
      };
      const ant = {
        size: 10,
        position,
        theta: randRange(0, 2 * Math.PI),
        speed: randRange(0, 10),
        omega: 0,
      };
      ants.push(ant);
    }
    setWorld((prevWorld) => ({ ...prevWorld, ants }));
    setRunning(true);
  }, []);

  const update = (deltaTime: number) => {
    setTicks((prevTicks) => prevTicks + 1);
    setWorld((prevWorld) => ({ ...prevWorld, ants: prevWorld.ants.map(updateAnt) }));
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

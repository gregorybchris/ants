import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import PointRange from "../../lib/data/point-range";
import SimGraphics from "../SimGraphics/SimGraphics";
import { clipPoint } from "../../lib/math/point-math";
import { clipScaler } from "../../lib/math/vector-math";
import { randRange } from "../../lib/math/random-math";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [ants, setAnts] = useState<Ant[]>([]);
  const worldBounds: PointRange = { x: { min: -500, max: 500 }, y: { min: -500, max: 500 } };
  const [viewBounds, setViewBounds] = useState<PointRange>({ x: { min: -500, max: 500 }, y: { min: -500, max: 500 } });

  useEffect(() => {
    const onKeyPress = (keyName: KeyName) => {
      if (keyName == Keyboard.Keys.LETTER_P) {
        setRunning((prevRunning) => !prevRunning);
      }

      if (keyName == Keyboard.Keys.SPACE) {
        setAnts((prevAnts: Ant[]) => {
          return prevAnts.map((prevAnt: Ant) => {
            const position = { ...prevAnt.position, y: prevAnt.position.y + 20 };
            return { ...prevAnt, position };
          });
        });
      }
    };
    new Keyboard(onKeyPress);
  }, []);

  useEffect(() => {
    const numAnts = 100;
    const newAnts = [];
    for (let i = 0; i < numAnts; i++) {
      const position = {
        x: (worldBounds.x.min + worldBounds.x.max) / 2,
        y: (worldBounds.y.min + worldBounds.y.max) / 2,
      };
      const newAnt = {
        size: 10,
        position,
        theta: randRange(0, 2 * Math.PI),
        speed: randRange(0, 1),
        omega: 0,
      };
      newAnts.push(newAnt);
    }
    setAnts(newAnts);
  }, []);

  const update = (deltaTime: number) => {
    setTicks((prevTicks) => prevTicks + 1);
    setAnts((prevAnts: Ant[]) => prevAnts.map(updateAnt));
  };

  const updateAnt = (ant: Ant): Ant => {
    const speedRange = { min: 0, max: 5 };
    const omegaRange = { min: -Math.PI / 8, max: Math.PI / 8 };
    const dOmegaRange = { min: -Math.PI / 10, max: Math.PI / 10 };

    const p = ant.position;
    const omega = clipScaler(ant.omega + randRange(dOmegaRange.min, dOmegaRange.max), omegaRange);
    const theta = ant.theta + omega;
    const speed = clipScaler(ant.speed + omega, speedRange);
    const vx = Math.cos(theta) * speed;
    const vy = Math.sin(theta) * speed;
    const position = clipPoint({ x: p.x + vx, y: p.y + vy }, worldBounds);
    return { ...ant, position, theta, speed };
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} bounds={viewBounds} running={running} ants={ants} />
    </div>
  );
}

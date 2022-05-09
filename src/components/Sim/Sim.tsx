import "./Sim.sass";
import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { emptyWorld, generateWorld } from "../../lib/sim/generator";
import { useEffect, useState } from "react";

import Ant from "../../lib/sim/ant";
import PointRange from "../../lib/data/point-range";
import Random from "../../lib/math/random";
import SimGraphics from "../SimGraphics/SimGraphics";
import Transmitter from "../../lib/sim/transmitter";
import { TransmitterType } from "../../lib/sim/transmitter-type";
import { World } from "../../lib/sim/world";
import { clipPoint } from "../../lib/math/point-math";
import { clipScaler } from "../../lib/math/vector-math";

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
    return {
      ...world,
      ants: world.ants.map(updateAnt),
      transmitters: [...world.transmitters, ...dropTransmitters(world.ants)],
    };
  };

  const dropTransmitters = (ants: Ant[]): Transmitter[] => {
    const transmitters: Transmitter[] = [];
    ants.forEach((ant: Ant) => {
      const position = ant.position;
      if (random.dice(1000)) transmitters.push({ position, transmitterType: TransmitterType.ALPHA });
      if (random.dice(10000)) transmitters.push({ position, transmitterType: TransmitterType.BETA });
      if (random.dice(100000)) transmitters.push({ position, transmitterType: TransmitterType.GAMMA });
    });
    return transmitters;
  };

  const updateAnt = (ant: Ant): Ant => {
    const speedRange = { min: 0, max: 1 };
    const omegaRange = { min: -Math.PI / 8, max: Math.PI / 8 };
    const dOmegaRange = { min: -Math.PI / 10, max: Math.PI / 10 };

    const omega = clipScaler(ant.omega + random.next(dOmegaRange.min, dOmegaRange.max), omegaRange);
    const theta = ant.theta + omega;
    const speed = clipScaler(ant.speed + random.next(-0.1, 0.1), speedRange);
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

import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/io/keyboard";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import Box from "../../lib/data/box";
import SimGraphics from "../SimGraphics/SimGraphics";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [ants, setAnts] = useState<Ant[]>([]);
  const boundsRef = useRef<Box>({ width: 1000, height: 1000 });

  useEffect(() => {
    const onKeyPress = (keyName: KeyName) => {
      if (keyName == Keyboard.Keys.LETTER_P) {
        setRunning((prevRunning) => !prevRunning);
      }

      if (keyName == Keyboard.Keys.SPACE) {
        setAnts((prevAnts: Ant[]) => {
          return prevAnts.map((prevAnt: Ant) => {
            const newPosition = { x: prevAnt.position.x, y: prevAnt.position.y + 20 };
            return { ...prevAnt, position: newPosition };
          });
        });
      }
    };
    new Keyboard(onKeyPress);
  }, []);

  useEffect(() => {
    const numAnts = 10;
    const newAnts = [];
    for (let i = 0; i < numAnts; i++) {
      const position = { x: 0, y: 20 };
      const velocity = { x: 1, y: 0 };
      const newAnt = {
        position: position,
        velocity: velocity,
      };
      newAnts.push(newAnt);
    }
    setAnts(newAnts);
  }, []);

  const update = (deltaTime: number) => {
    setTicks((prevTicks) => prevTicks + 1);
    setAnts((prevAnts: Ant[]) => {
      return prevAnts.map((ant: Ant) => {
        const p = ant.position;
        const v = ant.velocity;
        const newPosition = { x: p.x + v.x, y: p.y + v.y };
        return { ...ant, position: newPosition };
      });
    });
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} running={running} ants={ants} />
    </div>
  );
}

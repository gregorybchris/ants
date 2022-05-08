import "@fontsource/poppins";

import { useEffect, useState } from "react";

import Ant from "../../lib/ant";
import Keyboard from "../../lib/keyboard";
import SimGraphics from "../SimGraphics/SimGraphics";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [ants, setAnts] = useState<Ant[]>([]);

  useEffect(() => {
    new Keyboard((keyName) => {
      if (keyName == Keyboard.Keys.LETTER_P) {
        setRunning((prevRunning) => !prevRunning);
      }

      if (keyName == Keyboard.Keys.SPACE) {
        setAnts((prevAnts: Ant[]) => {
          const lastPosition = prevAnts[prevAnts.length - 1].position;
          const position = { x: lastPosition.x, y: lastPosition.y + 20 };
          const newAnt = {
            position: position,
          };
          return [...prevAnts, newAnt];
        });
      }
    });

    const newAnts = [
      {
        position: { x: 40, y: 40 },
      },
    ];
    setAnts(newAnts);
  }, []);

  const onUpdate = (currentTime: number, deltaTime: number) => {
    if (running) {
      setTicks((prevTicks) => prevTicks + 1);
      setAnts((prevAnts: Ant[]) => {
        return prevAnts.map((ant: Ant) => {
          return { ...ant, position: { x: ant.position.x + 1, y: ant.position.y } };
        });
      });
    }
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={onUpdate} running={running} ants={ants} />
    </div>
  );
}

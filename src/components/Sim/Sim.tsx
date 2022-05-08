import "@fontsource/poppins";

import Keyboard, { KeyName } from "../../lib/keyboard";
import { useEffect, useState } from "react";

import Ant from "../../lib/ant";
import SimGraphics from "../SimGraphics/SimGraphics";

export default function Sim() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(true);
  const [ants, setAnts] = useState<Ant[]>([]);

  useEffect(() => {
    const onKeyPress = (keyName: KeyName) => {
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
    };
    new Keyboard(onKeyPress);

    const newAnts = [
      {
        position: { x: 40, y: 40 },
      },
    ];
    setAnts(newAnts);
  }, []);

  const update = (deltaTime: number) => {
    setTicks((prevTicks) => prevTicks + 1);
    setAnts((prevAnts: Ant[]) => {
      return prevAnts.map((ant: Ant) => {
        return { ...ant, position: { x: ant.position.x + 1, y: ant.position.y } };
      });
    });
  };

  return (
    <div className="Sim">
      <SimGraphics onUpdate={update} running={running} ants={ants} />
    </div>
  );
}

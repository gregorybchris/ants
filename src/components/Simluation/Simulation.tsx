import "./Simulation.sass";
import "@fontsource/poppins";

import { Color, colorToHex } from "../../lib/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/ant";
import Box from "../../lib/box";
import Keyboard from "../../lib/keyboard";

export default function Simulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<Box>({ width: 0, height: 0 });
  const [ants, setAnts] = useState<Ant[]>([]);

  useEffect(() => {
    console.log("Starting simulation");

    new Keyboard((keyName) => {
      if ((keyName = Keyboard.Keys.SPACE)) {
        console.log("SPACE");
      }
    });

    const newAnts = [
      {
        position: { x: 40, y: 60 },
      },
      {
        position: { x: 80, y: 100 },
      },
    ];
    setAnts(newAnts);

    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasSize({ width: canvas.width, height: canvas.height });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas) {
      const ratio = 5;
      canvas.width = canvasSize.width * ratio;
      canvas.height = canvasSize.height * ratio;
    }

    if (canvas && context) {
      const radius = 10;
      const color = Color.RED;

      context.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ants.forEach((ant) => {
        const position = ant.position;
        context.beginPath();
        context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        context.fillStyle = colorToHex(color);
        context.fill();
      });
    }
  }, [ants]);

  return (
    <div className="Simulation">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

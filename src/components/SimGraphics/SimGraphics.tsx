import "./SimGraphics.sass";
import "@fontsource/poppins";

import { Color, colorToHex } from "../../lib/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/ant";
import Box from "../../lib/box";

interface SimGraphicsProps {
  running: boolean;
  onUpdate: (currentTime: number, deltaTime: number) => void;
  ants: Ant[];
}

export default function SimGraphics(props: SimGraphicsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<Box>({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasSize({ width: canvas.width, height: canvas.height });
    }

    getUpdate(props.onUpdate)(0);
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
      renderScene(context);
    }
  }, [props.ants]);

  const renderScene = (context: CanvasRenderingContext2D) => {
    const radius = 10;
    const color = Color.RED;

    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    props.ants.forEach((ant: Ant) => {
      context.beginPath();
      context.arc(ant.position.x, ant.position.y, radius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(color);
      context.fill();
    });
  };

  const getUpdate = (onUpdate: (currentTime: number, deltaTime: number) => void) => {
    let lastTime = 0;
    const update = (currentTime: number) => {
      currentTime = currentTime || 0;
      const deltaTime = currentTime - (lastTime || 0);
      lastTime = currentTime;
      onUpdate(currentTime, deltaTime);
      requestAnimationFrame(update);
    };
    return update;
  };

  return (
    <div className="SimGraphics">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

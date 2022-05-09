import "./SimGraphics.sass";
import "@fontsource/poppins";

import { Color, colorToHex } from "../../lib/graphics/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import Box from "../../lib/data/box";
import Point from "../../lib/data/point";
import PointRange from "../../lib/data/point-range";
import { useAnimationFrame } from "./animation";

interface SimGraphicsProps {
  running: boolean;
  onUpdate: (deltaTime: number) => void;
  ants: Ant[];
  bounds: PointRange;
}

export default function SimGraphics(props: SimGraphicsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<Box>({ width: 0, height: 0 });

  useAnimationFrame(props.onUpdate, props.running);

  useEffect(() => {
    resetCanvasSize();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resetCanvasSize);
    return () => window.removeEventListener("resize", resetCanvasSize);
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      renderScene(context);
    }
  }, [props.ants]);

  const resetCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasSize({ width: canvas.getBoundingClientRect().width, height: canvas.getBoundingClientRect().height });
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
    }
  };

  const scaleToCanvas = (point: Point): Point => {
    const b = props.bounds;
    const x = ((point.x - b.x.min) / (b.x.max - b.x.min)) * canvasSize.width;
    const y = ((point.y - b.x.min) / (b.y.max - b.y.min)) * canvasSize.height;
    return { x, y };
  };

  const renderScene = (context: CanvasRenderingContext2D) => {
    const radius = 5;
    const color = Color.RED;

    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    props.ants.forEach((ant: Ant) => {
      context.beginPath();
      const position = scaleToCanvas(ant.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(color);
      context.fill();
    });
  };

  return (
    <div className="SimGraphics">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

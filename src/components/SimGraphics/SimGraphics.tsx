import "./SimGraphics.sass";
import "@fontsource/poppins";

import { Color, colorToHex } from "../../lib/graphics/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import Box from "../../lib/data/box";
import Nutrient from "../../lib/sim/nutrient";
import Pheromone from "../../lib/sim/pheromone";
import { PheromoneType } from "../../lib/sim/pheromone-type";
import Point from "../../lib/data/point";
import PointRange from "../../lib/data/point-range";
import { World } from "../../lib/sim/world";
import { useAnimationFrame } from "./animation";

interface SimGraphicsProps {
  running: boolean;
  onUpdate: (deltaTime: number) => void;
  world: World;
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
  }, [props.world]);

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
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    renderNutrients(context);
    renderPheromones(context);
    renderAnts(context);
  };

  const renderNutrients = (context: CanvasRenderingContext2D) => {
    const radius = 3;
    const nutrientColor = Color.WHITE;
    props.world.nutrients.forEach((nutrient: Nutrient) => {
      context.beginPath();
      const position = scaleToCanvas(nutrient.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(nutrientColor);
      context.fill();
    });
  };

  const renderPheromones = (context: CanvasRenderingContext2D) => {
    const radius = 3;
    const alphaPheromoneColor = Color.BLUE;
    const betaPheromoneColor = Color.GREEN;
    const gammaPheromoneColor = Color.PURPLE;
    const deltaPheromoneColor = Color.YELLOW;
    props.world.pheromones.forEach((pheromone: Pheromone) => {
      context.beginPath();
      const position = scaleToCanvas(pheromone.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      if (pheromone.type == PheromoneType.ALPHA) {
        context.fillStyle = colorToHex(alphaPheromoneColor);
      } else if (pheromone.type == PheromoneType.BETA) {
        context.fillStyle = colorToHex(betaPheromoneColor);
      } else if (pheromone.type == PheromoneType.GAMMA) {
        context.fillStyle = colorToHex(gammaPheromoneColor);
      } else if (pheromone.type == PheromoneType.DELTA) {
        context.fillStyle = colorToHex(deltaPheromoneColor);
      }
      context.fill();
    });
  };

  const renderAnts = (context: CanvasRenderingContext2D) => {
    const radius = 5;
    const antColor = Color.RED;
    props.world.ants.forEach((ant: Ant) => {
      context.beginPath();
      const position = scaleToCanvas(ant.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(antColor);
      context.fill();
    });
  };

  return (
    <div className="SimGraphics">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

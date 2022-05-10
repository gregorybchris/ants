import "./SimGraphics.sass";
import "@fontsource/poppins";

import { Color, colorToHex, hexToRGB, rgbToString } from "../../lib/graphics/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import Box from "../../lib/data/box";
import Nest from "../../lib/sim/nest";
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
    const y = canvasSize.height - ((point.y - b.x.min) / (b.y.max - b.y.min)) * canvasSize.height;
    return { x, y };
  };

  const renderScene = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    renderNests(context);
    renderPheromones(context);
    renderNutrients(context);
    renderAnts(context);
  };

  const renderNests = (context: CanvasRenderingContext2D) => {
    const radius = 8;
    const nestColor = Color.BROWN;
    props.world.nests.forEach((nest: Nest) => {
      context.beginPath();
      const position = scaleToCanvas(nest.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(nestColor);
      context.fill();
    });
  };

  const renderPheromones = (context: CanvasRenderingContext2D) => {
    const radius = 3;
    props.world.pheromones.forEach((pheromone: Pheromone) => {
      context.beginPath();
      const position = scaleToCanvas(pheromone.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);

      let color = Color.WHITE;
      if (pheromone.type == PheromoneType.ALPHA) color = Color.BLUE;
      else if (pheromone.type == PheromoneType.BETA) color = Color.GREEN;
      else if (pheromone.type == PheromoneType.GAMMA) color = Color.PURPLE;
      else if (pheromone.type == PheromoneType.DELTA) color = Color.YELLOW;

      const rgbColor = hexToRGB(colorToHex(color));
      const rgbColorString = rgbToString({ ...rgbColor, alpha: pheromone.strength });
      context.fillStyle = rgbColorString;
      context.fill();
    });
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

  const renderAnts = (context: CanvasRenderingContext2D) => {
    const antRadius = 5;
    const nutrientRadius = 2;
    const antColor = Color.BLACK;
    const nutrientColor = Color.WHITE;

    props.world.ants.forEach((ant: Ant) => {
      const position = scaleToCanvas(ant.position);
      context.beginPath();
      context.arc(position.x, position.y, antRadius, 0, 2 * Math.PI);
      context.fillStyle = colorToHex(antColor);
      context.fill();

      if (ant.carrying) {
        context.beginPath();
        context.arc(position.x, position.y, nutrientRadius, 0, 2 * Math.PI);
        context.fillStyle = colorToHex(nutrientColor);
        context.fill();
      }
    });
  };

  return (
    <div className="SimGraphics">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

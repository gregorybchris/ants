import "./SimGraphics.sass";
import "@fontsource/poppins";

import { Color, colorToHex } from "../../lib/graphics/color";
import { useEffect, useRef, useState } from "react";

import Ant from "../../lib/sim/ant";
import Box from "../../lib/data/box";
import Nutrient from "../../lib/sim/nutrient";
import Point from "../../lib/data/point";
import PointRange from "../../lib/data/point-range";
import Transmitter from "../../lib/sim/transmitter";
import { TransmitterType } from "../../lib/sim/transmitter-type";
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
    renderTransmitters(context);
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

  const renderTransmitters = (context: CanvasRenderingContext2D) => {
    const radius = 3;
    const alphaTransmitterColor = Color.BLUE;
    const betaTransmitterColor = Color.GREEN;
    const gammaTransmitterColor = Color.PURPLE;
    const deltaTransmitterColor = Color.YELLOW;
    props.world.transmitters.forEach((transmitter: Transmitter) => {
      context.beginPath();
      const position = scaleToCanvas(transmitter.position);
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      if (transmitter.transmitterType == TransmitterType.ALPHA) {
        context.fillStyle = colorToHex(alphaTransmitterColor);
      } else if (transmitter.transmitterType == TransmitterType.BETA) {
        context.fillStyle = colorToHex(betaTransmitterColor);
      } else if (transmitter.transmitterType == TransmitterType.GAMMA) {
        context.fillStyle = colorToHex(gammaTransmitterColor);
      } else if (transmitter.transmitterType == TransmitterType.DELTA) {
        context.fillStyle = colorToHex(deltaTransmitterColor);
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

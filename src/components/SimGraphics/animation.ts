import { useEffect, useRef } from "react";

export const useAnimationFrame = (callback: (deltaTime: number) => void, running: boolean) => {
  const requestRef = useRef<number>();
  const currentTimeRef = useRef<number>();

  const animate = (currentTime: number) => {
    if (currentTimeRef.current) {
      callback(currentTime - currentTimeRef.current);
    }

    currentTimeRef.current = currentTime;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (running) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current || 0);
  }, [running]);
};

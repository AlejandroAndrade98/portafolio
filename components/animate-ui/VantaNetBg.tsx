"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

type VantaInstance = { destroy: () => void };

type VantaNetBgProps = {
  className?: string;
  color?: number; // 0xrrggbb
  backgroundColor?: number; // 0xrrggbb
  points?: number;
  maxDistance?: number;
  spacing?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
};

export default function VantaNetBg({
  className,
  color = 0x38bdf8, // sky-400
  backgroundColor = 0x000000,
  points = 10,
  maxDistance = 22,
  spacing = 18,
  mouseControls = false,
  touchControls = false,
  gyroControls = false,
}: VantaNetBgProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<VantaInstance | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!elRef.current) return;

      // Import dinámico para evitar problemas SSR / window
      const THREEImport = (await import("three")) as unknown as typeof THREE;
      const NET = (await import("vanta/dist/vanta.net.min")).default;

      if (cancelled || !elRef.current) return;

      // Crea el efecto
      vantaRef.current = NET({
        el: elRef.current,
        THREE: THREEImport,
        mouseControls,
        touchControls,
        gyroControls,
        color,
        backgroundColor,
        points,
        maxDistance,
        spacing,
      });
    })();

    return () => {
      cancelled = true;
      if (vantaRef.current?.destroy) vantaRef.current.destroy();
      vantaRef.current = null;
    };
  }, [
    color,
    backgroundColor,
    points,
    maxDistance,
    spacing,
    mouseControls,
    touchControls,
    gyroControls,
  ]);

  return <div ref={elRef} className={className} />;
}

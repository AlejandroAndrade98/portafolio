"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

type LockAxis = "" | "x" | "y";

export function useOrbit3D(isMobile: boolean) {
  const ORBIT_STEP = 120;
  const ORBIT_COUNT = 3;
  const ORBIT_RADIUS = 520;

  // ✅ ref SOLO interno — no lo devolvemos
  const orbitStageRef = useRef<HTMLDivElement | null>(null);

  // ✅ callback ref (esto NO dispara el warning)
  const setOrbitStageEl = useCallback((node: HTMLDivElement | null) => {
    orbitStageRef.current = node;
  }, []);

  const orbitDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startAngle: -ORBIT_STEP,
    lock: "" as LockAxis,
    captured: false,
  });

  const [orbitDragging, setOrbitDragging] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(-ORBIT_STEP);
  const orbitAngleRef = useRef(-ORBIT_STEP);

  const [orbitActive, setOrbitActive] = useState(1);

  // recalculo glow al traer MagicBento al frente
  useEffect(() => {
    if (!isMobile) return;
    if (orbitActive === 0) window.dispatchEvent(new Event("mb:recalc"));
  }, [orbitActive, isMobile]);

  // reset al entrar a mobile
  useEffect(() => {
  if (!isMobile) return;

  const resetAngle = -ORBIT_STEP;

  // ✅ refs se pueden setear inmediato
  orbitAngleRef.current = resetAngle;

  orbitDragRef.current.startAngle = resetAngle;
  orbitDragRef.current.lock = "";
  orbitDragRef.current.active = false;
  orbitDragRef.current.captured = false;

  // ✅ setState ASÍNCRONO (evita el warning del compiler)
  const raf = requestAnimationFrame(() => {
    setOrbitAngle((prev) => (prev === resetAngle ? prev : resetAngle));
    setOrbitActive((prev) => (prev === 1 ? prev : 1));
    setOrbitDragging(false);
  });

  return () => cancelAnimationFrame(raf);
}, [isMobile, ORBIT_STEP]);

  const orbitIndexFromAngle = useCallback(
    (angle: number) => {
      const snapped = Math.round(angle / ORBIT_STEP) * ORBIT_STEP;
      const idx =
        (((-snapped / ORBIT_STEP) % ORBIT_COUNT) + ORBIT_COUNT) % ORBIT_COUNT;
      return { snapped, idx };
    },
    [ORBIT_COUNT, ORBIT_STEP]
  );

  

  const snapOrbitToAngle = useCallback(
    (nextAngle: number) => {
      const { snapped, idx } = orbitIndexFromAngle(nextAngle);
      setOrbitAngle(snapped);
      orbitAngleRef.current = snapped;
      setOrbitActive(idx);
      orbitDragRef.current.startAngle = snapped;
    },
    [orbitIndexFromAngle]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isMobile) return;

      orbitDragRef.current.active = true;
      orbitDragRef.current.pointerId = e.pointerId;
      orbitDragRef.current.startX = e.clientX;
      orbitDragRef.current.startY = e.clientY;
      orbitDragRef.current.startAngle = orbitAngleRef.current;
      orbitDragRef.current.lock = "";
      orbitDragRef.current.captured = false;

      setOrbitDragging(false);
    },
    [isMobile]
  );
  

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isMobile) return;
      if (!orbitDragRef.current.active) return;

      const el = orbitStageRef.current;
      if (!el) return;

      const dx = e.clientX - orbitDragRef.current.startX;
      const dy = e.clientY - orbitDragRef.current.startY;

      if (!orbitDragRef.current.lock) {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const TH = 8;

        if (ax < TH && ay < TH) return;

        orbitDragRef.current.lock = ax > ay ? "x" : "y";

        if (orbitDragRef.current.lock === "x") {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          orbitDragRef.current.captured = true;
          setOrbitDragging(true);
        } else {
          return; // deja scroll vertical normal
        }
      }

      if (orbitDragRef.current.lock !== "x") return;

      const width = Math.max(1, el.clientWidth);
      const next = orbitDragRef.current.startAngle + (dx / width) * ORBIT_STEP;

      e.preventDefault();

      orbitAngleRef.current = next;
      setOrbitAngle(next);

      const approx = orbitIndexFromAngle(next);
      setOrbitActive(approx.idx);
    },
    [isMobile, ORBIT_STEP, orbitIndexFromAngle]
  );
  

  const onPointerUp = useCallback(() => {
    if (!isMobile) return;
    if (!orbitDragRef.current.active) return;

    orbitDragRef.current.active = false;

    if (orbitDragRef.current.lock !== "x") {
      orbitDragRef.current.lock = "";
      orbitDragRef.current.captured = false;
      setOrbitDragging(false);
      return;
    }

    orbitDragRef.current.lock = "";
    orbitDragRef.current.captured = false;
    setOrbitDragging(false);

    snapOrbitToAngle(orbitAngleRef.current);
  }, [isMobile, snapOrbitToAngle]);

  return {
    ORBIT_STEP,
    ORBIT_RADIUS,

    orbitDragging,
    orbitAngle,
    orbitActive,

    snapOrbitToAngle,

    // ✅ en vez de ref, devolvemos callback ref
    setOrbitStageEl,

    // handlers sueltos (más simple que orbit.handlers.*)
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
  
}

export type Orbit3DController = ReturnType<typeof useOrbit3D>;

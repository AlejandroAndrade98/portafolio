"use client";

import { useEffect, useRef } from "react";
import type * as React from "react";
import "./PixelCard.css";

/* =======================
   Pixel class (sin cambios)
======================= */
class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize;
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  draw() {
    const offset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) this.isShimmer = true;
    this.isShimmer ? this.shimmer() : (this.size += this.sizeStep);
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

/* =======================
   Component
======================= */
export default function PixelCard({
  variant = "default",
  className = "",
  active = false,
  children,
}: {
  variant?: "default" | "blue" | "yellow" | "pink";
  className?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const visibleRef = useRef(true);
  const modeRef = useRef<"appear" | "disappear">("disappear");
  const lastTimeRef = useRef(performance.now());

  /* ---------- helpers ---------- */
  const stop = () => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const start = (mode: "appear" | "disappear") => {
    modeRef.current = mode;
    if (!visibleRef.current || runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  };

  const loop = () => {
    if (!runningRef.current || !visibleRef.current) {
      stop();
      return;
    }

    const now = performance.now();
    if (now - lastTimeRef.current < 1000 / 60) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    lastTimeRef.current = now;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) {
      stop();
      return;
    }

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    const fn = modeRef.current;

    for (const p of pixelsRef.current) {
      
      p[fn]();
      if (!p.isIdle) allIdle = false;
    }

    if (allIdle) {
      stop();
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  /* ---------- init pixels ---------- */
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;

    const colors = ["#f8fafc", "#cbd5e1"];
    const px: Pixel[] = [];

    for (let x = 0; x < rect.width; x += 6) {
      for (let y = 0; y < rect.height; y += 6) {
        px.push(new Pixel(canvasRef.current, ctx, x, y, colors[Math.random() * 2 | 0], 0.25, Math.hypot(x, y)));
      }
    }
    pixelsRef.current = px;
  }, []);

  /* ---------- visibility ---------- */
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = !!e?.isIntersecting;
        if (!visibleRef.current) stop();
        else if (active) start("appear");
      },
      { threshold: 0.01 }
    );
    if (containerRef.current) io.observe(containerRef.current);
    return () => io.disconnect();
  }, [active]);

  /* ---------- active sync ---------- */
  useEffect(() => {
    active ? start("appear") : start("disappear");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      data-active={active}
      onMouseEnter={() => start("appear")}
      onMouseLeave={() => !active && start("disappear")}
    >
      <canvas ref={canvasRef} className="pixel-canvas" />
      {children}
    </div>
  );
}

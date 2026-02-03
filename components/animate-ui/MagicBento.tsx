"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export type BentoCard = {
  id: string;
  title: string;
  description: string;
  label?: string;
  color?: string;
  targetSelector?: string;
};

export interface MagicBentoProps {
  cards: BentoCard[];

  textAutoHide?: boolean;

  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;

  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;

  enableStars?: boolean;
  particleCount?: number;

  glowColor?: string; // hover "R, G, B"
  spotlightRadius?: number;

  enableIdleGlow?: boolean;
  idleGlowColor?: string; // idle "R, G, B"
  idleGlowIntensity?: number; // 0..1
  idleSpeed?: number; // 0.2..1.2
  idlePadding?: number; // px

  layout?: "auto" | "bento" | "stacked";
  stackedMinHeight?: number;
  stackedRowMinHeight?: number;

  disableAnimations?: boolean;
  className?: string;

  onCardClick?: (card: BentoCard) => void;

  /**
   * ✅ Nuevo:
   * Pausa REAL del motor (sin desmontar ni reinstalar listeners/ticker/RAF)
   */
  isActive?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 8;
const DEFAULT_SPOTLIGHT_RADIUS = 320;

const DEFAULT_GLOW_COLOR = "34, 211, 238";
const DEFAULT_IDLE_GLOW_COLOR = "99, 102, 241";

const DEFAULT_IDLE_INTENSITY = 0.22;
const DEFAULT_IDLE_SPEED = 0.6;
const DEFAULT_IDLE_PADDING = 26;

type CSSVars = React.CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

type DocumentWithFonts = Document & {
  fonts?: { ready: Promise<unknown> };
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [query]);

  return matches;
}

function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function useCoarsePointer() {
  return useMediaQuery("(pointer: coarse), (hover: none)");
}

function makeParticle(
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: string,
  dur: number,
  delay: number,
  scale: number
) {
  const el = document.createElement("span");
  el.className = "mb-particle mb-particle--float";
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
  el.style.setProperty("--dx", `${dx}px`);
  el.style.setProperty("--dy", `${dy}px`);
  el.style.setProperty("--c", color);

  el.style.setProperty("--dur", `${dur}s`);
  el.style.setProperty("--d", `${delay}s`);
  el.style.setProperty("--s", `${scale}`);

  return el;
}

export default function MagicBento({
  cards,

  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,

  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,

  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,

  glowColor = DEFAULT_GLOW_COLOR,

  enableIdleGlow = true,
  idleGlowColor = DEFAULT_IDLE_GLOW_COLOR,
  idleGlowIntensity = DEFAULT_IDLE_INTENSITY,
  idleSpeed = DEFAULT_IDLE_SPEED,
  idlePadding = DEFAULT_IDLE_PADDING,

  layout = "auto",
  stackedMinHeight = 360,
  stackedRowMinHeight = 108,

  disableAnimations = false,
  className = "",
  onCardClick,

  isActive = true,
}: MagicBentoProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const reduceMotion = usePrefersReducedMotion();
  const isCoarse = useCoarsePointer();

  const disableAll = disableAnimations || reduceMotion;
  const disableHoverFx = disableAll || isCoarse;

  // ✅ ref para pausar sin reinstalar efectos
  const activeRef = useRef<boolean>(isActive);
  useEffect(() => {
    activeRef.current = isActive;

    // si se desactiva, apaga spotlight inmediatamente
    const spot = spotlightRef.current;
    if (!isActive && spot) {
      spot.style.opacity = "0";
    }
  }, [isActive]);

  const effectiveTextAutoHide = textAutoHide;

  const resolvedLayout = useMemo(() => {
    if (layout === "bento" || layout === "stacked") return layout;
    return cards.length === 3 ? "stacked" : "bento";
  }, [layout, cards.length]);

  const gridStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (resolvedLayout !== "stacked") return undefined;
    return {
      gridTemplateColumns: "1fr",
      gridAutoRows: `minmax(${stackedRowMinHeight}px, 1fr)`,
      minHeight: stackedMinHeight,
    };
  }, [resolvedLayout, stackedMinHeight, stackedRowMinHeight]);

  const handleNavigate = useCallback(
    (card: BentoCard) => {
      onCardClick?.(card);
      if (card.targetSelector) {
        document.querySelector(card.targetSelector)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [onCardClick]
  );

  const cardClass = useMemo(() => {
    return [
      "mb-card",
      effectiveTextAutoHide ? "mb-card--autohide" : "mb-card--noautohide",
      enableBorderGlow ? "mb-card--borderglow" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [effectiveTextAutoHide, enableBorderGlow]);

  const sectionVars = useMemo<CSSVars>(() => {
    return { "--mb-glow-color": idleGlowColor };
  }, [idleGlowColor]);

  const spotlightVars = useMemo<CSSVars>(() => {
    return { "--mb-glow-color": idleGlowColor };
  }, [idleGlowColor]);

  // =========================
  // Glow engine (Idle + Hover + Touch pulse)
  // =========================
  useEffect(() => {
    if (disableAll) return;

    const section = sectionRef.current;
    const grid = gridRef.current;
    const spot = spotlightRef.current;

    if (!section || !grid) return;

    let active = true;
    let io: IntersectionObserver | null = null;

    if (!isCoarse) {
      io = new IntersectionObserver(
        ([entry]) => {
          active = entry.isIntersecting;
          if (!active && spot) spot.style.opacity = "0";
        },
        { threshold: 0.01 }
      );
      io.observe(section);
    }

    type CardInfo = { el: HTMLElement; rect: DOMRect; cx: number; cy: number };
    let sectionRect = section.getBoundingClientRect();
    let cardsInfo: CardInfo[] = [];

    const measure = () => {
      sectionRect = section.getBoundingClientRect();

      const els = Array.from(grid.querySelectorAll<HTMLElement>(".mb-card"));
      cardsInfo = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, rect: r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        })
        .filter((c) => Number.isFinite(c.rect.width) && Number.isFinite(c.rect.height));
    };

    const clampPct = (v: number, fallback = 50) => {
      if (!Number.isFinite(v)) return fallback;
      return Math.max(0, Math.min(100, v));
    };

    const qx = spot ? gsap.quickTo(spot, "x", { duration: 0.18, ease: "power2.out" }) : null;
    const qy = spot ? gsap.quickTo(spot, "y", { duration: 0.18, ease: "power2.out" }) : null;
    const qop = spot ? gsap.quickTo(spot, "opacity", { duration: 0.22, ease: "power2.out" }) : null;

    const state = {
      hovering: false,
      lastX: 0,
      lastY: 0,
      forceUntil: 0,
      idleT: 0,
    };

    let scheduled = false;
    let raf = 0;

    const schedule = () => {
      if (!active) return;
      if (!activeRef.current) return; // ✅ pausa real
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    const applyAt = (clientX: number, clientY: number, color: string, baseIntensity: number) => {
      section.style.setProperty("--mb-glow-color", color);

      if (spot && qx && qy && qop) {
        const sx = clientX - sectionRect.left;
        const sy = clientY - sectionRect.top;

        spot.style.setProperty("--mb-glow-color", color);
        qx(sx);
        qy(sy);
        qop(0.5);
      }

      const radius = Math.max(140, spotlightRadius);
      const rInner = radius * 0.42;
      const rOuter = radius;

      for (const c of cardsInfo) {
        const dist = Math.hypot(clientX - c.cx, clientY - c.cy);
        let intensity = 0;

        if (dist <= rInner) intensity = 1;
        else if (dist <= rOuter) intensity = (rOuter - dist) / (rOuter - rInner);

        const finalIntensity = Math.max(baseIntensity, intensity);

        const w = Math.max(1, c.rect.width);
        const h = Math.max(1, c.rect.height);

        const relX = clampPct(((clientX - c.rect.left) / w) * 100, 50);
        const relY = clampPct(((clientY - c.rect.top) / h) * 100, 50);

        c.el.style.setProperty("--mb-glow-x", `${relX}%`);
        c.el.style.setProperty("--mb-glow-y", `${relY}%`);
        c.el.style.setProperty("--mb-glow-intensity", `${finalIntensity}`);
        c.el.style.setProperty("--mb-glow-radius", `${radius}px`);
        c.el.style.setProperty("--mb-glow-color", color);
      }
    };

    const firstPaint = () => {
      measure();
      sectionRect = section.getBoundingClientRect();

      const cx = sectionRect.left + sectionRect.width * 0.5;
      const cy = sectionRect.top + sectionRect.height * 0.55;

      state.lastX = cx;
      state.lastY = cy;

      const base = Math.max(0.12, Math.min(0.28, idleGlowIntensity));
      applyAt(cx, cy, idleGlowColor, base);

      schedule();
    };

    const update = () => {
      scheduled = false;
      raf = 0;
      if (!active) return;
      if (!activeRef.current) return; // ✅ pausa real

      sectionRect = section.getBoundingClientRect();

      if (!cardsInfo.length) measure();

      const now = Date.now();
      const forced = now < state.forceUntil;

      const useHover = (!disableHoverFx && state.hovering) || forced;
      const color = useHover ? glowColor : idleGlowColor;
      const base = useHover ? 0 : Math.max(0.12, Math.min(0.28, idleGlowIntensity));

      applyAt(state.lastX, state.lastY, color, base);
    };

    const onEnter = () => {
      if (!active) return;
      if (!activeRef.current) return;
      state.hovering = true;
      measure();
      schedule();
    };

    const onLeave = () => {
      state.hovering = false;
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      if (!activeRef.current) return;
      if (disableHoverFx) return;

      const inside =
        e.clientX >= sectionRect.left &&
        e.clientX <= sectionRect.right &&
        e.clientY >= sectionRect.top &&
        e.clientY <= sectionRect.bottom;

      if (!inside) return;

      state.lastX = e.clientX;
      state.lastY = e.clientY;
      schedule();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!active) return;
      if (!activeRef.current) return;
      if (!isCoarse) return;

      measure();
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.forceUntil = Date.now() + 850;

      section.classList.add("mb--pulse");
      window.setTimeout(() => section.classList.remove("mb--pulse"), 280);

      schedule();
    };

    let pendingMeasure = false;
    const scheduleMeasure = () => {
      if (!activeRef.current) return;
      if (pendingMeasure) return;
      pendingMeasure = true;
      requestAnimationFrame(() => {
        pendingMeasure = false;
        measure();
        schedule();
      });
    };

    const recalcBurst = () => {
      if (!activeRef.current) return;
      const end = performance.now() + 700;

      const tick = () => {
        if (!active) return;
        if (!activeRef.current) return;
        measure();
        schedule();
        if (performance.now() < end) requestAnimationFrame(tick);
      };

      requestAnimationFrame(() => requestAnimationFrame(tick));
    };

    const onRecalc = () => {
      recalcBurst();
    };

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
    window.addEventListener("mb:recalc", onRecalc);

    let tickerAdded = false;
    const idleTick = () => {
      if (!active) return;
      if (!activeRef.current) return; // ✅ pausa real
      if (!enableIdleGlow) return;
      if (!disableHoverFx && state.hovering) return;

      state.idleT += (gsap.ticker.deltaRatio() / 60) * idleSpeed;
      sectionRect = section.getBoundingClientRect();

      const pad = Math.max(0, idlePadding);
      const w = Math.max(1, sectionRect.width - pad * 2);
      const h = Math.max(1, sectionRect.height - pad * 2);

      const x = sectionRect.left + pad + w * (0.5 + 0.43 * Math.sin(state.idleT));
      const y =
        sectionRect.top +
        pad +
        h * (0.5 + 0.3 * Math.sin(state.idleT * 0.9 + 1.55));

      state.lastX = x;
      state.lastY = y;

      schedule();
    };

    if (!reduceMotion && enableIdleGlow) {
      gsap.ticker.add(idleTick);
      tickerAdded = true;
      if (spot && qop) qop(0.45);
    }

    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerdown", onPointerDown);

    requestAnimationFrame(() => requestAnimationFrame(firstPaint));

    const doc = document as DocumentWithFonts;
    doc.fonts?.ready.then(() => recalcBurst()).catch(() => {});

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();

      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("mb:recalc", onRecalc);

      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onPointerDown);

      if (tickerAdded) gsap.ticker.remove(idleTick);
    };
  }, [
    disableAll,
    disableHoverFx,
    isCoarse,
    reduceMotion,
    enableIdleGlow,
    idleGlowColor,
    idleGlowIntensity,
    idleSpeed,
    idlePadding,
    glowColor,
    spotlightRadius,
  ]);

  return (
    <div ref={sectionRef} className={`mb-section ${className}`.trim()} style={sectionVars}>
      {enableSpotlight && !disableAll && (
        <div className="mb-spotlightLayer" aria-hidden="true">
          <div ref={spotlightRef} className="mb-spotlight" style={spotlightVars} />
          <div className="mb-aurora" />
          <div className="mb-grain" />
        </div>
      )}

      <div ref={gridRef} className="mb-grid" style={gridStyle}>
        {cards.map((card) => (
          <BentoCardItem
            key={card.id}
            card={card}
            className={cardClass}
            glowColor={glowColor}
            disableAll={disableAll}
            disableHoverFx={disableHoverFx}
            particleCount={Math.min(10, Math.max(0, particleCount))}
            enableStars={enableStars}
            enableTilt={enableTilt}
            enableMagnetism={enableMagnetism}
            clickEffect={clickEffect}
            stacked={resolvedLayout === "stacked"}
            onClick={() => handleNavigate(card)}
          />
        ))}
      </div>
    </div>
  );
}

function BentoCardItem({
  card,
  className,
  glowColor,
  disableAll,
  disableHoverFx,
  particleCount,
  enableStars,
  enableTilt,
  enableMagnetism,
  clickEffect,
  stacked,
  onClick,
}: {
  card: BentoCard;
  className: string;
  glowColor: string;
  disableAll: boolean;
  disableHoverFx: boolean;
  particleCount: number;
  enableStars: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  stacked: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const particlesRef = useRef<HTMLSpanElement[]>([]);
  const killTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { transformPerspective: 900 });

    const qrx = gsap.quickTo(el, "rotationX", { duration: 0.18, ease: "power2.out" });
    const qry = gsap.quickTo(el, "rotationY", { duration: 0.18, ease: "power2.out" });
    const qx = gsap.quickTo(el, "x", { duration: 0.22, ease: "power2.out" });
    const qy = gsap.quickTo(el, "y", { duration: 0.22, ease: "power2.out" });

    let hovering = false;

    const clearParticles = () => {
      if (killTimerRef.current) {
        window.clearTimeout(killTimerRef.current);
        killTimerRef.current = null;
      }

      particlesRef.current.forEach((p) => {
        gsap.to(p, {
          opacity: 0,
          duration: 0.18,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      });
      particlesRef.current = [];
    };

    const spawnFloatingParticles = (mode: "hover" | "tap") => {
      if (disableAll) return;
      if (!enableStars) return;

      clearParticles();

      const r = el.getBoundingClientRect();
      const count = Math.min(9, Math.max(0, particleCount));

      for (let i = 0; i < count; i++) {
        const x = Math.random() * r.width;
        const y = Math.random() * r.height;

        const dx = (Math.random() - 0.5) * 70;
        const dy = (Math.random() - 0.5) * 70;

        const dur = 2.2 + Math.random() * 1.8;
        const delay = Math.random() * 0.35;
        const scale = 0.75 + Math.random() * 0.75;

        const p = makeParticle(x, y, dx, dy, glowColor, dur, delay, scale);
        el.appendChild(p);
        particlesRef.current.push(p);

        gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
      }

      if (mode === "tap") {
        killTimerRef.current = window.setTimeout(() => {
          clearParticles();
        }, 950);
      }
    };

    const onEnter = () => {
      hovering = true;
      el.dataset.hover = "true";
      if (!disableHoverFx) spawnFloatingParticles("hover");
      gsap.to(el, { scale: 1.01, duration: 0.16, ease: "power2.out" });
    };

    const onLeave = () => {
      hovering = false;
      delete el.dataset.hover;

      clearParticles();

      gsap.to(el, { scale: 1, duration: 0.18, ease: "power2.out" });
      qrx(0);
      qry(0);
      qx(0);
      qy(0);
    };

    const onMove = (e: PointerEvent) => {
      if (!hovering) return;
      if (disableHoverFx) return;
      if (!enableTilt && !enableMagnetism) return;

      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;

      if (enableTilt) {
        const rx = ((y - cy) / cy) * -8;
        const ry = ((x - cx) / cx) * 8;
        qrx(rx);
        qry(ry);
      }

      if (enableMagnetism) {
        const mx = (x - cx) * 0.035;
        const my = (y - cy) * 0.035;
        qx(mx);
        qy(my);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (disableHoverFx) spawnFloatingParticles("tap");

      if (!clickEffect || disableAll) return;

      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const maxD = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height)
      );

      const ripple = document.createElement("span");
      ripple.className = "mb-ripple";
      ripple.style.setProperty("--mb-ripple-size", `${maxD * 2}px`);
      ripple.style.setProperty("--mb-ripple-x", `${x - maxD}px`);
      ripple.style.setProperty("--mb-ripple-y", `${y - maxD}px`);
      ripple.style.setProperty("--mb-glow-color", glowColor);

      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    if (!disableHoverFx) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointermove", onMove);
    }

    el.addEventListener("pointerdown", onPointerDown);

    return () => {
      if (!disableHoverFx) {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("pointermove", onMove);
      }
      el.removeEventListener("pointerdown", onPointerDown);
      clearParticles();
    };
  }, [
    glowColor,
    disableAll,
    disableHoverFx,
    particleCount,
    enableStars,
    enableTilt,
    enableMagnetism,
    clickEffect,
  ]);

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={onClick}
      style={{
        background: card.color ?? "rgba(10, 12, 22, 0.78)",
        minHeight: stacked ? 108 : undefined,
      }}
    >
      <div className="mb-card__top">
        <span className="mb-card__label">{card.label ?? "Go"}</span>
        <span className="mb-card__chev" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="mb-card__content">
        <h3 className="mb-card__title">{card.title}</h3>
        <p className="mb-card__desc">{card.description}</p>
      </div>

      <div className="mb-card__innerGlow" aria-hidden="true" />
    </button>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export type BentoCard = {
  id: string;
  title: string;
  description: string;
  label?: string;
  color?: string; // fondo del card
  targetSelector?: string; // a dónde hace scroll, ej: "#about"
};

export interface MagicBentoProps {
  cards: BentoCard[];

  // features (igual que Reactbits)
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;

  spotlightRadius?: number;
  particleCount?: number;

  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;

  glowColor?: string; // "R, G, B"  ej: "34, 211, 238"
  className?: string;

  onCardClick?: (card: BentoCard) => void;
}

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 280;
const DEFAULT_GLOW_COLOR = "34, 211, 238"; // cyan (match con tu vibe)
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x: number, y: number, color: string): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "mb-particle";
  el.style.cssText = `
    left:${x}px; top:${y}px;
    background: rgba(${color}, 1);
    box-shadow: 0 0 10px rgba(${color}, 0.65);
  `;
  return el;
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

export default function MagicBento({
  cards,

  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,

  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,

  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,

  glowColor = DEFAULT_GLOW_COLOR,
  className = "",

  onCardClick
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  const handleNavigate = useCallback((card: BentoCard) => {
    onCardClick?.(card);

    if (card.targetSelector) {
      document.querySelector(card.targetSelector)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [onCardClick]);

  // Spotlight global (solo dentro del área del bento)
  useEffect(() => {
    if (!enableSpotlight || shouldDisableAnimations || !gridRef.current) return;

    const spotlight = document.createElement("div");
    spotlight.className = "mb-spotlight";
    spotlight.style.setProperty("--mb-glow-color", glowColor);
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const onMove = (e: MouseEvent) => {
      if (!gridRef.current || !spotlightRef.current) return;

      const section = gridRef.current.closest(".mb-section") as HTMLElement | null;
      const rect = section?.getBoundingClientRect();
      const inside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cardsEls = gridRef.current.querySelectorAll<HTMLElement>(".mb-card");

      if (!inside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });
        cardsEls.forEach((c) => c.style.setProperty("--mb-glow-intensity", "0"));
        return;
      }

        // cuando lo creas, una sola vez
        gsap.set(spotlight, { xPercent: -50, yPercent: -50, x: -9999, y: -9999 });

        // y en el mousemove
        gsap.to(spotlightRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
        });

      // glow por proximidad
      cardsEls.forEach((cardEl) => {
        const r = cardEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2;

        const d = Math.max(0, dist);
        const proximity = spotlightRadius * 0.5;
        const fade = spotlightRadius * 0.9;

        let intensity = 0;
        if (d <= proximity) intensity = 1;
        else if (d <= fade) intensity = (fade - d) / (fade - proximity);

        const relX = ((e.clientX - r.left) / r.width) * 100;
        const relY = ((e.clientY - r.top) / r.height) * 100;

        cardEl.style.setProperty("--mb-glow-x", `${relX}%`);
        cardEl.style.setProperty("--mb-glow-y", `${relY}%`);
        cardEl.style.setProperty("--mb-glow-intensity", `${intensity}`);
        cardEl.style.setProperty("--mb-glow-radius", `${spotlightRadius}px`);
        cardEl.style.setProperty("--mb-glow-color", glowColor);
      });
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      spotlightRef.current?.remove();
      spotlightRef.current = null;
    };
  }, [enableSpotlight, shouldDisableAnimations, spotlightRadius, glowColor]);

  const cardClass = useMemo(() => {
    return [
      "mb-card",
      textAutoHide ? "mb-card--autohide" : "",
      enableBorderGlow ? "mb-card--borderglow" : ""
    ].filter(Boolean).join(" ");
  }, [textAutoHide, enableBorderGlow]);

  return (
    <div className={`mb-section ${className}`.trim()}>
      <div ref={gridRef} className="mb-grid">
        {cards.map((card) => (
          <BentoCardItem
            key={card.id}
            card={card}
            className={cardClass}
            glowColor={glowColor}
            shouldDisableAnimations={shouldDisableAnimations}
            particleCount={particleCount}
            enableStars={enableStars}
            enableTilt={enableTilt}
            enableMagnetism={enableMagnetism}
            clickEffect={clickEffect}
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
  shouldDisableAnimations,
  particleCount,
  enableStars,
  enableTilt,
  enableMagnetism,
  clickEffect,
  onClick
}: {
  card: BentoCard;
  className: string;
  glowColor: string;
  shouldDisableAnimations: boolean;
  particleCount: number;
  enableStars: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const particles = useRef<HTMLDivElement[]>([]);
  const timeouts = useRef<number[]>([]);
  const hovered = useRef(false);

  const clearParticles = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    particles.current.forEach((p) => {
      gsap.to(p, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: "back.in(1.7)",
        onComplete: () => p.remove()
      });
    });
    particles.current = [];
  }, []);

  useEffect(() => {
    if (shouldDisableAnimations || !ref.current) return;

    const el = ref.current;

    const onEnter = () => {
      hovered.current = true;

      if (enableStars) {
        const rect = el.getBoundingClientRect();
        for (let i = 0; i < particleCount; i++) {
          const t = window.setTimeout(() => {
            if (!hovered.current || !ref.current) return;
            const p = createParticleElement(Math.random() * rect.width, Math.random() * rect.height, glowColor);
            el.appendChild(p);
            particles.current.push(p);

            gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" });
            gsap.to(p, {
              x: (Math.random() - 0.5) * 90,
              y: (Math.random() - 0.5) * 90,
              rotation: Math.random() * 360,
              duration: 2 + Math.random() * 2,
              ease: "none",
              repeat: -1,
              yoyo: true
            });
            gsap.to(p, { opacity: 0.35, duration: 1.4, ease: "power2.inOut", repeat: -1, yoyo: true });
          }, i * 80);

          timeouts.current.push(t);
        }
      }

      if (enableTilt) {
        gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.22, ease: "power2.out", transformPerspective: 900 });
      }
    };

    const onLeave = () => {
      hovered.current = false;
      clearParticles();

      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.25, ease: "power2.out" });
    };

    const onMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;

      if (enableTilt) {
        const rx = ((y - cy) / cy) * -10;
        const ry = ((x - cx) / cx) * 10;
        gsap.to(el, { rotateX: rx, rotateY: ry, duration: 0.12, ease: "power2.out", transformPerspective: 900 });
      }

      if (enableMagnetism) {
        const mx = (x - cx) * 0.05;
        const my = (y - cy) * 0.05;
        gsap.to(el, { x: mx, y: my, duration: 0.25, ease: "power2.out" });
      }
    };

    const onClickFx = (e: MouseEvent) => {
      if (!clickEffect) return;

      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const maxD = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height)
      );

      const ripple = document.createElement("div");
      ripple.className = "mb-ripple";
      ripple.style.setProperty("--mb-ripple-size", `${maxD * 2}px`);
      ripple.style.setProperty("--mb-ripple-x", `${x - maxD}px`);
      ripple.style.setProperty("--mb-ripple-y", `${y - maxD}px`);
      ripple.style.setProperty("--mb-glow-color", glowColor);

      el.appendChild(ripple);

      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("click", onClickFx);

    return () => {
      hovered.current = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClickFx);
      clearParticles();
    };
  }, [shouldDisableAnimations, particleCount, enableStars, enableTilt, enableMagnetism, clickEffect, glowColor, clearParticles]);

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      style={{
        backgroundColor: card.color ?? "rgba(10,10,18,0.65)",
        // @ts-expect-error CSS var
        "--mb-glow-color": glowColor
      }}
      onClick={onClick}
    >
      <div className="mb-card__top">
        <span className="mb-card__label">{card.label ?? "Go"}</span>
      </div>

      <div className="mb-card__content">
        <h3 className="mb-card__title">{card.title}</h3>
        <p className="mb-card__desc">{card.description}</p>
      </div>
    </button>
  );
}

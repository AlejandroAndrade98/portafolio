"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MobileIntroMask.module.css";

const ANIM_MS = 3200;
const STORAGE_KEY = "introMaskShown";

export default function MobileIntroMask() {
  const [visible, setVisible] = useState(false);

  const didInit = useRef(false);         // 🚩 evita doble-run en dev/StrictMode
  const finished = useRef(false);        // 🚩 evita doble finish
  const finishRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (typeof window === "undefined") return;

    const isMobile =
      window.matchMedia("(max-width: 1024px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    if (!isMobile) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isProd = process.env.NODE_ENV === "production";

    // 🚩 comportamiento en dev vs prod
    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;

      // En dev: siempre vuelve a salir
      if (!isProd) sessionStorage.removeItem(STORAGE_KEY);

      // Si fue reload: deja que vuelva a salir (útil para debug)
      if (nav?.type === "reload") sessionStorage.removeItem(STORAGE_KEY);

      // En prod: 1 vez por sesión
      if (isProd && sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    const restoreScroll = () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };

    const finish = () => {
      if (finished.current) return;
      finished.current = true;

      restoreScroll();

      // marca como visto (solo prod)
      try {
        if (isProd) sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore
      }

      // 🚩 Edge/ScrollTrigger: fuerza recalcular medidas
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("mobile-intro-mask-done"));
      });

      setVisible(false);
    };

    finishRef.current = finish;

    // lock scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // ✅ clave: NO setState síncrono dentro del effect
    requestAnimationFrame(() => setVisible(true));

    // fallback por si Edge no dispara animationend
    const t = window.setTimeout(finish, ANIM_MS + 250);

    return () => {
      window.clearTimeout(t);
      if (!finished.current) restoreScroll();
      finishRef.current = null;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      data-mobile-intro-mask="1" // 🚩 por si quieres detectarlo desde otro lado
      className={styles.overlay}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return; // solo el overlay
        finishRef.current?.();
      }}
    >
      <svg
        className={styles.svgMask}
        viewBox="0 0 1200 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>

        <g className={styles.maskGroup}>
          <text
            x="50%"
            y="170"
            textAnchor="middle"
            className={styles.svgText}
            fontSize="150"
            fill="url(#textGrad)"
          >
            software
          </text>
          <text
            x="50%"
            y="310"
            textAnchor="middle"
            className={styles.svgText}
            fontSize="150"
            fill="url(#textGrad)"
          >
            developer
          </text>
        </g>
      </svg>
    </div>
  );
}

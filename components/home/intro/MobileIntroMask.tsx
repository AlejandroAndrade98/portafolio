"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MobileIntroMask.module.css";

const ANIM_MS = 3200;

export default function MobileIntroMask() {
  const [visible, setVisible] = useState(false);
  const didInit = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (didInit.current) return; // 🚩 evita double-run en dev/StrictMode
    didInit.current = true;

    if (typeof window === "undefined") return;

    const isMobile =
      window.matchMedia("(max-width: 1024px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    if (!isMobile) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isProd = process.env.NODE_ENV === "production"; // 🚩 en dev: que reaparezca en reload
    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;

      // 🚩 Si recargas, deja que vuelva a salir
      if (nav?.type === "reload") sessionStorage.removeItem("introMaskShown");

      // 🚩 En dev, NO persistimos "introMaskShown"
      if (!isProd) sessionStorage.removeItem("introMaskShown");

      // 🚩 En prod: 1 vez por sesión
      if (isProd && sessionStorage.getItem("introMaskShown")) return;
    } catch {
      // ignore
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    const restore = () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };

    const finish = () => {
      if (finished.current) return;
      finished.current = true;

      restore();
      setVisible(false);

      // 🚩 marca como visto (solo en prod)
      try {
        if (isProd) sessionStorage.setItem("introMaskShown", "true");
      } catch {
        // ignore
      }

      // 🚩 avisa a GSAP/ScrollTrigger que refresque mediciones
      window.dispatchEvent(new Event("mobile-intro-mask-done"));
      window.dispatchEvent(new Event("resize"));
    };

    // lock scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    setVisible(true);

    // 🚩 fallback por si Edge no dispara animationend
    const t = window.setTimeout(finish, ANIM_MS + 200);

    return () => {
      window.clearTimeout(t);
      restore();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      data-mobile-intro-mask="1" // 🚩 para detectar overlay si lo necesitas
      className={styles.overlay}
      onAnimationEnd={(e) => {
  if (e.target !== e.currentTarget) return;

  // unlock scroll
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  try {
    if (process.env.NODE_ENV === "production") {
      sessionStorage.setItem("introMaskShown", "true");
    }
  } catch {}

  // ✅ Edge fix: fuerza reflow + repaint
  void document.body.offsetHeight; // 🚩 fuerza reflow
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("mobile-intro-mask-done"));
  });

  setVisible(false);
}}
    >
      <svg className={styles.svgMask} viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
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

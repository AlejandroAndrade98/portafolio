"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useIntroGsap(
  mainRef: RefObject<HTMLElement | null>,
  isMobile: boolean
) {
  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const isCoarse =
      ScrollTrigger.isTouch || window.matchMedia("(pointer: coarse)").matches;

    if (!isCoarse) ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      gsap.set("#fade-layer", { opacity: 0 });

      gsap.set("#ambient-bg", { autoAlpha: 0, y: 0, filter: "blur(0px)" });
      gsap.set("#logo-mask", { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#hero-key", { autoAlpha: 1, opacity: 1, scale: 1 });

      gsap.set("#hero-overlay", { autoAlpha: 1, opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#about-bg", { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: "#intro",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            if (self.direction === -1) gsap.set("#fade-layer", { opacity: 0 });
          },
        },
      });

      tl.to("#hero-key", { scale: 1, duration: 1 }, 0);
      tl.to("#hero-overlay", { autoAlpha: 0, y: -10, filter: "blur(10px)", duration: 1 }, "<");
      tl.to("#ambient-bg", { autoAlpha: 1, duration: 0.6 }, 0.25);

      const maskAt = isMobile ? 0.3 : 0.3;
      tl.to(
        "#logo-mask",
        { maskSize: "clamp(60vh, 20%, 30vh)", webkitMaskSize: "clamp(60vh, 20%, 30vh)", duration: 0.6 },
        maskAt
      );

      tl.to("#hero-key", { opacity: 0, duration: 0.4 }, 0.5);
      tl.to("#fade-layer", { opacity: 1, duration: 0.22 }, 1.02);

      tl.to("#logo-mask", { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.32 }, 1.05);
      tl.to("#ambient-bg", { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.32 }, 1.05);

      tl.to("#about-bg", { autoAlpha: 1, duration: 0.55 }, 1.1);

      tl.set("#logo-mask", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#ambient-bg", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#hero-overlay", { y: 0, filter: "blur(0px)" }, 1.32);

      tl.to("#fade-layer", { opacity: 0, duration: 0.32 }, 1.26);

      gsap.fromTo(
        "#about-content",
        { opacity: 0, y: 30, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          scrollTrigger: {
            trigger: "#about",
            start: "top 78%",
            end: "top 55%",
            scrub: 2,
          },
        }
      );
    }, root); // ✅ scope real (HTMLElement)

    return () => {
      ScrollTrigger.normalizeScroll(false);
      ctx.revert();
    };
  }, [isMobile]); // ✅ mainRef no es necesario aquí
}

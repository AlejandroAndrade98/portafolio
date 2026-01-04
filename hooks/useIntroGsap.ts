"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useIntroGsap(mainRef: RefObject<HTMLElement | null>, isMobile: boolean) {
  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const isCoarse =
      ScrollTrigger.isTouch || window.matchMedia("(pointer: coarse)").matches;

    if (!isCoarse) ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const fadeLayer = q("#fade-layer")[0] as HTMLElement | undefined;

      const intro = q("#intro")[0] as HTMLElement | undefined;
      const ambientBg = q("#ambient-bg")[0] as HTMLElement | undefined;
      const logoMask = q("#logo-mask")[0] as HTMLElement | undefined;
      const heroKey = q("#hero-key")[0] as HTMLElement | undefined;
      const heroOverlay = q("#hero-overlay")[0] as HTMLElement | undefined;

      const aboutBg = q("#about-bg")[0] as HTMLElement | undefined;
      const about = q("#about")[0] as HTMLElement | undefined;
      const aboutContent = q("#about-content")[0] as HTMLElement | undefined;

      // ===== estados base =====
      if (fadeLayer) gsap.set(fadeLayer, { autoAlpha: 0 });

      if (ambientBg) gsap.set(ambientBg, { autoAlpha: 0, y: 0, filter: "blur(0px)" });
      if (logoMask) gsap.set(logoMask, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      if (heroKey) gsap.set(heroKey, { autoAlpha: 1, opacity: 1, scale: 1 });
      if (heroOverlay) gsap.set(heroOverlay, { autoAlpha: 1, opacity: 1, y: 0, filter: "blur(0px)" });

      if (aboutBg) gsap.set(aboutBg, { autoAlpha: 0 });

      // ===== Intro timeline (scrub) =====
      if (intro && fadeLayer && heroKey && heroOverlay && ambientBg && logoMask && aboutBg) {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: intro,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // al subir, evita que quede el negro pegado
              if (self.direction === -1) gsap.set(fadeLayer, { autoAlpha: 0 });
            },
          },
        });

        tl.to(heroKey, { scale: 1, duration: 1 }, 0);
        tl.to(heroOverlay, { autoAlpha: 0, y: -10, filter: "blur(10px)", duration: 1 }, "<");
        tl.to(ambientBg, { autoAlpha: 1, duration: 0.6 }, 0.25);

        tl.to(
          logoMask,
          {
            maskSize: "clamp(60vh, 20%, 30vh)",
            webkitMaskSize: "clamp(60vh, 20%, 30vh)",
            duration: 0.6,
          },
          0.3
        );

        tl.to(heroKey, { opacity: 0, duration: 0.4 }, 0.5);

        // negro solo para el swap máscara -> about (como ya lo tenías)
        tl.to(fadeLayer, { autoAlpha: 1, duration: 0.22 }, 1.02);

        tl.to(logoMask, { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.32 }, 1.05);
        tl.to(ambientBg, { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.32 }, 1.05);

        tl.to(aboutBg, { autoAlpha: 1, duration: 0.55 }, 1.1);

        tl.set([logoMask, ambientBg, heroOverlay], { y: 0, filter: "blur(0px)" }, 1.32);
        tl.to(fadeLayer, { autoAlpha: 0, duration: 0.32 }, 1.26);
      }

      // ===== About content reveal =====
      if (about && aboutContent) {
        gsap.fromTo(
          aboutContent,
          { autoAlpha: 0, y: 30, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            scrollTrigger: {
              trigger: about,
              start: "top 78%",
              end: "top 55%",
              scrub: 2,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, root);

    return () => {
      ctx.revert();
      if (!isCoarse) ScrollTrigger.normalizeScroll(false);
    };
  }, [isMobile]);
}

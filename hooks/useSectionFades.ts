"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSectionFades(mainRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const fade = document.getElementById("section-fade");
      if (!fade) return;

      const targets = ["projects", "stack"]; // secciones que NO deben verse antes
      const els = targets
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      // Estado inicial
      gsap.set(fade, { opacity: 0 });
      gsap.set(els, { autoAlpha: 0 });

      const fadeIn = () =>
        gsap.to(fade, { opacity: 1, duration: 0.18, ease: "power2.out", overwrite: true });

      const fadeOut = () =>
        gsap.to(fade, { opacity: 0, duration: 0.28, ease: "power2.out", overwrite: true });

      const show = (el: HTMLElement) =>
        gsap.to(el, { autoAlpha: 1, duration: 0.01, overwrite: true });

      const hide = (el: HTMLElement) =>
        gsap.set(el, { autoAlpha: 0 });

      els.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          // cuando entra
          onEnter: () => {
            fadeIn();
            gsap.delayedCall(0.12, () => {
              show(el);
              fadeOut();
            });
          },
          // cuando vuelves hacia arriba
          onLeaveBack: () => {
            hide(el);
            gsap.set(fade, { opacity: 0 });
          },
          // si entras desde abajo (scroll up)
          onEnterBack: () => {
            fadeIn();
            gsap.delayedCall(0.12, () => {
              show(el);
              fadeOut();
            });
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [mainRef]);
}

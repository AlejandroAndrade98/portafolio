"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useAboutProjectsTransition(
  mainRef: RefObject<HTMLElement | null>,
  isMobile: boolean
) {
  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const fade = document.getElementById("fade-layer");
      const aboutBg = document.getElementById("about-bg");
      const about = document.getElementById("about");
      const projects = document.getElementById("projects");

      if (!fade || !about || !projects) return;

      // estado base seguro
      gsap.set(fade, { opacity: 0 });

      // ✅ esto evita el “negro largo” – solo hacemos autoAlpha en el rango del scrub
      // al inicio (arriba) projects puede quedar en 0 – pero NO afecta layout
      if (!reduced) gsap.set(projects, { autoAlpha: 0 });

      const start = isMobile ? "bottom 82%" : "bottom 78%";
      const end = isMobile ? "bottom 62%" : "bottom 58%";

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: about,
          start,
          end,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1) entrar a negro
      tl.to(fade, { opacity: 1, duration: 0.22 }, 0);

      // 2) apagar about-bg mientras está negro
      if (aboutBg) tl.to(aboutBg, { autoAlpha: 0, duration: 0.35 }, 0.06);

      // 3) revelar projects desde oscuro (igual vibe que about-content)
      if (!reduced) {
        tl.fromTo(
          projects,
          { autoAlpha: 0, y: 18, filter: "blur(10px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55 },
          0.14
        );
      } else {
        tl.set(projects, { autoAlpha: 1 }, 0.14);
      }

      // 4) salir del negro
      tl.to(fade, { opacity: 0, duration: 0.35 }, 0.42);
    }, root);

    return () => ctx.revert();
  }, [mainRef, isMobile]);
}

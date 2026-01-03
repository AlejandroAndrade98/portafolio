"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useProjectsShowcaseGsap(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const projects = gsap.utils.toArray<HTMLElement>("[data-project]");

      projects.forEach((card) => {
        const header = card.querySelector<HTMLElement>("[data-project-head]");
        const shots = gsap.utils.toArray<HTMLElement>("[data-shot]", card);

        // Reveal del bloque completo (suave, simétrico)
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 70, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );

        if (header) {
          gsap.fromTo(
            header,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Animación de screenshots + parallax sutil
        const dirs = [
          { x: -50, y: 25 },
          { x: 50, y: -25 },
          { x: 0, y: 45 },
          { x: -35, y: -35 },
        ];

        shots.forEach((shot, i) => {
          const d = dirs[i % dirs.length];

          gsap.fromTo(
            shot,
            { autoAlpha: 0, x: d.x, y: d.y, scale: 0.965 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.7,
              delay: i * 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.to(shot, {
            yPercent: -6 * ((i % 3) + 1),
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}

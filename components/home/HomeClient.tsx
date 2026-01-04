"use client";

import { useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIntroGsap } from "@/hooks/useIntroGsap";
import { useOrbit3D } from "@/hooks/useOrbit3D";


import hero from "@/content/home/hero.json";
import about from "@/content/home/about.json";
import aboutPixelCards from "@/content/home/aboutPixelCards.json";
import stack from "@/content/home/stack.json";
import projectsShowcase from "@/content/home/projectsShowcase.json";
import { orbitItems } from "@/lib/heroOrbitItems";

import IntroSection from "@/components/home/IntroSection";
import AboutSection from "@/components/home/AboutSection";
import StackSection from "@/components/home/StackSection";
import ProjectsSection from "@/components/home/ProjectsSection";

export default function HomeClient() {
  const mainRef = useRef<HTMLElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // ✅ overlay global – se usa para intro y para about->projects
  // (IMPORTANTE: ya no debe existir otro #fade-layer en IntroSection)
  useIntroGsap(mainRef, isMobile);
  // useAboutProjectsTransition(mainRef, isMobile);

  const orbit = useOrbit3D(isMobile);

  return (
    <main ref={mainRef} className="relative">
      <div
        id="fade-layer"
        className="fixed inset-0 z-[9999] bg-black pointer-events-none"
        style={{ opacity: 0 }}
      />

      <IntroSection hero={hero} orbitItems={orbitItems} orbit={orbit} />
      <AboutSection about={about} pixelCards={aboutPixelCards} />

      <ProjectsSection
        title={projectsShowcase.title}
        subtitle={projectsShowcase.subtitle}
        items={projectsShowcase.items}
      />

      <StackSection title={stack.title} subtitle={stack.subtitle} />
    </main>
  );
}

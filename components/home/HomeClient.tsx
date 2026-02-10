"use client";

import { useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIntroGsap } from "@/hooks/useIntroGsap";

import hero from "@/content/home/hero.json";
import about from "@/content/home/about.json";
import aboutPixelCards from "@/content/home/aboutPixelCards.json";
import stack from "@/content/home/stack.json";
import projectsShowcase from "@/content/home/projectsShowcase.json";

import IntroSection from "@/components/home/IntroSection";
import AboutSection from "@/components/home/AboutSection";
import StackSection from "@/components/home/StackSection";
import ProjectsSection from "@/components/home/ProjectsSection";

import HomeHeader from "@/components/home/HomeHeader";

import type { ComponentProps } from "react";

export default function HomeClient() {
  const mainRef = useRef<HTMLElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // ✅ overlay global – se usa para intro y para about->projects
  useIntroGsap(mainRef, isMobile);

  type ProjectsSectionProps = ComponentProps<typeof ProjectsSection>;
  type ShowcaseItem = ProjectsSectionProps["items"][number];

  const items = projectsShowcase.items as unknown as ShowcaseItem[];

return (
  <>
    <HomeHeader hero={hero} />

    <main ref={mainRef} className="relative">
      <div
        id="fade-layer"
        className="fixed inset-0 z-[9999] bg-black pointer-events-none"
        style={{ opacity: 0 }}
      />

      <IntroSection hero={hero} isMobile={isMobile} />
      <AboutSection about={about} pixelCards={aboutPixelCards} />

      <ProjectsSection
        title={projectsShowcase.title}
        subtitle={projectsShowcase.subtitle}
        items={items}
      />

      <StackSection title={stack.title} subtitle={stack.subtitle} />
    </main>
  </>
);
}

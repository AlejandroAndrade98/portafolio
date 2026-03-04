"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIntroGsap } from "@/hooks/useIntroGsap";

import IntroSection from "@/components/home/IntroSection";
import AboutSection from "@/components/home/AboutSection";
import StackSection from "@/components/home/StackSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import HomeHeader from "@/components/home/HomeHeader";

type MenuData = typeof import("@/content/en/home/menu.json");

import type { ComponentProps } from "react";

type HeroData = typeof import("@/content/en/home/hero.json");
type AboutData = typeof import("@/content/en/home/about.json");
type AboutPixelCardsData = typeof import("@/content/en/home/aboutPixelCards.json");
type StackData = typeof import("@/content/en/home/stack.json");
type ProjectsShowcaseData = typeof import("@/content/en/home/projectsShowcase.json");
type ProjectsGalleriesData = typeof import("@/content/en/home/projectsGalleries.json");

type HomeClientProps = {
  locale: "en" | "es";
  hero: HeroData;
  about: AboutData;
  aboutPixelCards: AboutPixelCardsData;
  stack: StackData;
  projectsShowcase: ProjectsShowcaseData;
  projectsGalleries: ProjectsGalleriesData;
  menu: MenuData;
};

export default function HomeClient({
  hero,
  about,
  aboutPixelCards,
  stack,
  projectsShowcase,
  projectsGalleries,
  menu,
  locale,
}: HomeClientProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useIntroGsap(mainRef, isMobile);

  type ProjectsSectionProps = ComponentProps<typeof ProjectsSection>;
  type ShowcaseItem = ProjectsSectionProps["items"][number];

  const items = projectsShowcase.items as unknown as ShowcaseItem[];

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <HomeHeader hero={hero} locale={locale} menu={menu} />

      <main ref={mainRef} className="relative">
        <div
          id="fade-layer"
          className="fixed inset-0 z-[9999] bg-black pointer-events-none"
          style={{ opacity: 0 }}
        />

        <IntroSection hero={hero} isMobile={isMobile} locale={locale} />
        <AboutSection about={about} pixelCards={aboutPixelCards} />

        <ProjectsSection
          title={projectsShowcase.title}
          subtitle={projectsShowcase.subtitle}
          items={items}
          galleries={projectsGalleries.galleries}
          ctaProject={projectsShowcase.ui?.ctaProject}
          ctaRepo={projectsShowcase.ui?.ctaRepo}
        />

        <StackSection data={stack} />
      </main>
    </>
  );
}
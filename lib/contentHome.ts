import type { Locale } from "@/lib/i18n";

export async function loadHomeContent(locale: Locale) {
  const loaders = {
    en: async () => ({
      about: (await import("@/content/en/home/about.json")).default,
      aboutPixelCards: (await import("@/content/en/home/aboutPixelCards.json")).default,
      hero: (await import("@/content/en/home/hero.json")).default,
      projects: (await import("@/content/en/home/projects.json")).default,
      projectsGalleries: (await import("@/content/en/home/projectsGalleries.json")).default,
      projectsShowcase: (await import("@/content/en/home/projectsShowcase.json")).default,
      stack: (await import("@/content/en/home/stack.json")).default,
    }),
    es: async () => ({
      about: (await import("@/content/es/home/about.json")).default,
      aboutPixelCards: (await import("@/content/es/home/aboutPixelCards.json")).default,
      hero: (await import("@/content/es/home/hero.json")).default,
      projects: (await import("@/content/es/home/projects.json")).default,
      projectsGalleries: (await import("@/content/es/home/projectsGalleries.json")).default,
      projectsShowcase: (await import("@/content/es/home/projectsShowcase.json")).default,
      stack: (await import("@/content/es/home/stack.json")).default,
    }),
  } as const;

  return loaders[locale]();
}
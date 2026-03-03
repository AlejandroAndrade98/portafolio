"use client";

import * as React from "react";
import { ExternalLink, Github } from "lucide-react";
import ExpandableGallery, { type GalleryMedia } from "@/components/ui/ExpandableGallery";
import ScrollReveal from "../animate-ui/ScrollReveal";

type ProjectsShowcaseData = typeof import("@/content/en/home/projectsShowcase.json");
type ProjectsGalleriesData = typeof import("@/content/en/home/projectsGalleries.json");

type BaseShowcaseItem = ProjectsShowcaseData["items"][number];
type Galleries = ProjectsGalleriesData["galleries"];

type GalleryKey = keyof Galleries;

type ShowcaseItem = Omit<BaseShowcaseItem, "galleryKey"> & {
  galleryKey: GalleryKey;
};

type ProjectsSectionProps = {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
  galleries: Galleries;

  // ✅ textos UI traducibles
  ctaProject?: string; // "Ver proyecto" / "View project"
  ctaRepo?: string; // "Repo" / "Repo"
};

export default function ProjectsSection({
  title,
  subtitle,
  items,
  galleries,
  ctaProject = "Ver proyecto",
  ctaRepo = "Repo",
}: ProjectsSectionProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-24 lg:px-12 lg:pt-16"
    >
      <div data-projects-head className="mb-14 text-center">
        <ScrollReveal
          as="h2"
          className="
            text-center tracking-tight text-white
            font-[650]
            drop-shadow-[0_0_18px_rgba(56,189,248,0.25)]
            [&_.scroll-reveal-text]:text-[2.35rem]
            sm:[&_.scroll-reveal-text]:text-6xl
            lg:[&_.scroll-reveal-text]:text-6xl
            [&_.scroll-reveal-text]:leading-[1.1]
          "
          baseOpacity={0}
          enableBlur
          blurStrength={12}
          baseRotation={2}
        >
          {title}
        </ScrollReveal>

        <p className="mt-4 text-white/70 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-24">
        {items.map((p, idx) => {
          const flip = idx % 2 === 1;

          const shots = galleries[p.galleryKey] ?? [];

          const mediaItems: GalleryMedia[] = shots.map((s) =>
            s.type === "video"
              ? { type: "video", src: s.src, alt: s.alt, poster: s.poster }
              : { type: "image", src: s.src, alt: s.alt }
          );

          const hasHref = typeof p.href === "string" && p.href.trim().length > 0;
          const hasRepo = typeof p.repo === "string" && p.repo.trim().length > 0;

          return (
            <article
              key={`${p.id}-${idx}`}
              data-project
              className={[
                "relative",
                "flex flex-col gap-10",
                "lg:flex-row lg:gap-14",
                flip ? "lg:flex-row-reverse" : "",
              ].join(" ")}
            >
              {/* ===== TEXTO ===== */}
              <div
                data-project-head
                className={[
                  "w-full",
                  "lg:w-5/12",
                  "lg:min-h-[420px]",
                  "flex flex-col",
                ].join(" ")}
              >
                <div>
                  <p className="text-white/40 text-sm tracking-[0.25em] uppercase">
                    {String(idx + 1).padStart(2, "0")}
                  </p>

                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">{p.title}</h3>

                  <p className="mt-4 whitespace-pre-line text-white/75 leading-relaxed">
                    {p.description}
                  </p>

                  {!!p.tech?.length && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-3 lg:mt-auto lg:pt-7">
                  {hasHref && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/85 hover:bg-white/10 transition"
                    >
                      {ctaProject}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {hasRepo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/75 hover:bg-black/55 transition"
                    >
                      {ctaRepo}
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* ===== GALERÍA ===== */}
              <div className="w-full lg:w-7/12">
                <ExpandableGallery
                  items={mediaItems}
                  heightClass="h-[320px] sm:h-[360px] lg:h-[420px]"
                  className="shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                />
              </div>
            </article>
          );
        })}
      </div>

      <div id="projects-exit" aria-hidden className="h-px w-full" />
    </section>
  );
}
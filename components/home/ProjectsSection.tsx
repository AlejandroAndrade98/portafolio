"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { useProjectsShowcaseGsap } from "@/hooks/useProjectsShowcaseGsap";

type ProjectsShowcaseData = typeof import("@/content/home/projectsShowcase.json");
type ShowcaseItem = ProjectsShowcaseData["items"][number];

type ProjectsSectionProps = {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
};

export default function ProjectsSection({ title, subtitle, items }: ProjectsSectionProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  useProjectsShowcaseGsap(sectionRef);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-12"
    >
      {/* header */}
      <div className="mb-14 text-center">
        <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-white/70 text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="space-y-24">
        {items.map((p, idx) => {
          const flip = idx % 2 === 1;

          return (
            <article
              key={p.id}
              data-project
              className={[
                "relative",
                "grid items-start gap-10 lg:gap-14",
                "lg:grid-cols-12",
              ].join(" ")}
            >
              {/* Columna texto */}
              <div
                data-project-head
                className={[
                  "lg:col-span-5",
                  flip ? "lg:col-start-8" : "lg:col-start-1",
                ].join(" ")}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-white/40 text-sm tracking-[0.25em] uppercase">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-white/75 leading-relaxed">
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

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/85 hover:bg-white/10 transition"
                  >
                    Ver proyecto
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/75 hover:bg-black/55 transition"
                    >
                      Repo
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Columna bento */}
              <div
                className={[
                  "lg:col-span-7",
                  flip ? "lg:col-start-1" : "lg:col-start-6",
                ].join(" ")}
              >
                <div className="grid grid-cols-6 gap-3 auto-rows-[120px] sm:auto-rows-[150px] lg:auto-rows-[170px]">
                  {p.screenshots.map((s, i) => (
                    <div
                      key={`${p.id}-${i}`}
                      data-shot
                      className={[
                        "group relative overflow-hidden rounded-2xl",
                        "border border-white/10 bg-white/5",
                        "shadow-[0_20px_70px_rgba(0,0,0,0.45)]",
                        s.gridClass,
                      ].join(" ")}
                    >
                      <Image
                        src={s.src}
                        alt={s.alt ?? `${p.title} screenshot ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 900px"
                        className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        priority={idx === 0 && i === 0}
                      />

                      {/* overlay premium */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* borde glow sutil */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />

                      {/* punto esquina simétrico */}
                      <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-white/20 group-hover:bg-white/55 transition" />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

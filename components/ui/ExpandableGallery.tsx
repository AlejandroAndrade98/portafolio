"use client";

import * as React from "react";
import Image from "next/image";
import PixelCard from "@/components/reactbits/PixelCard";

export type GalleryMedia =
  | {
      type: "image";
      src: string;
      alt?: string;
      objectPosition?: string;
      label?: string;
    }
  | {
      type: "video";
      src: string;
      alt?: string;
      poster?: string;
      objectPosition?: string;
      label?: string;
    };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function defaultLabel(m: GalleryMedia, i: number) {
  if (m.label) return m.label;
  if (m.type === "video") return "Video";
  return `Imagen ${i + 1}`;
}

export default function ExpandableGallery({
  items,
  className = "",
  heightClass = "h-[320px] sm:h-[360px] lg:h-[420px]",
}: {
  items: GalleryMedia[];
  className?: string;
  heightClass?: string;
}) {
  const safeItems = items ?? [];
  const [active, setActive] = React.useState<number | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const videoRefs = React.useRef<Record<number, HTMLVideoElement | null>>({});

  React.useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") {
        setOpenIndex((v) => (v === null ? null : (v + 1) % safeItems.length));
      }
      if (e.key === "ArrowLeft") {
        setOpenIndex((v) => (v === null ? null : (v - 1 + safeItems.length) % safeItems.length));
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [openIndex, safeItems.length]);

  const open = (i: number) => setOpenIndex(i);
  const close = () => setOpenIndex(null);

  const anyActive = active !== null;

  const handleEnter = (i: number) => {
    setActive(i);

    const m = safeItems[i];
    if (m?.type === "video") {
      const el = videoRefs.current[i];
      if (el) {
        el.currentTime = Math.max(0, el.currentTime);
        el.play().catch(() => {});
      }
    }
  };

  const handleLeave = () => {
    if (active !== null) {
      const m = safeItems[active];
      if (m?.type === "video") {
        const el = videoRefs.current[active];
        if (el) el.pause();
      }
    }
    setActive(null);
  };

  if (!safeItems.length) return null;

  const opened = openIndex !== null ? safeItems[openIndex] : null;

  return (
    <>
      <div
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-white/5",
          "p-3 sm:p-4",
          className
        )}
        onMouseLeave={handleLeave}
      >
        <div className={cn("flex w-full gap-3", heightClass)}>
          {safeItems.map((m, i) => {
            const isActive = active === i;
            const showMediaAlways = i === 0;
            const shouldReveal = showMediaAlways || isActive;
            const showPlaceholder = i !== 0 && !shouldReveal;

            const label = defaultLabel(m, i);

            return (
              <button
                key={`${m.type}-${m.src}-${i}`}
                type="button"
                onMouseEnter={() => handleEnter(i)}
                onFocus={() => handleEnter(i)}
                onClick={() => {
                  setActive(i);
                  open(i);
                }}
                className={cn(
                  "group relative h-full overflow-hidden rounded-2xl",
                  "transition-[flex] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
                  "min-w-[64px] sm:min-w-[90px]",
                  anyActive ? (isActive ? "flex-[5]" : "flex-[1]") : "flex-[1]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                )}
                aria-label={m.alt ?? `Media ${i + 1}`}
                title="Click para expandir"
              >
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    shouldReveal ? "opacity-100" : "opacity-0"
                  )}
                >
                  {m.type === "image" ? (
                    <Image
                      src={m.src}
                      alt={m.alt ?? `Image ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 75vw, 1000px"
                      quality={90}
                      className={cn(
                        "object-cover transition-transform duration-700 ease-out",
                        shouldReveal ? "scale-[1.03]" : "scale-[1]"
                      )}
                      style={{ objectPosition: m.objectPosition ?? "center" }}
                    />
                  ) : (
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-700 ease-out",
                        shouldReveal ? "scale-[1.02]" : "scale-[1]"
                      )}
                      src={m.src}
                      poster={m.poster}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      style={{ objectPosition: m.objectPosition ?? "center" }}
                    />
                  )}
                </div>

                {i !== 0 && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      showPlaceholder ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <PixelCard active={true} variant="default" className="h-full w-full">
                      <div className="relative z-20 h-full w-full grid place-items-center">
                        <div className="text-center px-4">
                          <p className="text-white/55 text-[0.7rem] tracking-[0.35em] uppercase">
                            Preview
                          </p>
                          <p className="mt-3 text-white/90 text-3xl font-semibold">{label}</p>
                          <p className="mt-2 text-white/55 text-sm">Hover para ver</p>
                        </div>
                      </div>
                    </PixelCard>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/10" />
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    shouldReveal ? "opacity-0" : "opacity-25",
                    "bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                  )}
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
              </button>
            );
          })}
        </div>
      </div>

      {openIndex !== null && opened && (
        <div
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm"
          onMouseDown={close}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute left-1/2 top-1/2 w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <p className="text-sm text-white/80">{opened.alt ?? `Media ${openIndex + 1}`}</p>

                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Cerrar (ESC)
                </button>
              </div>

              <div className="relative aspect-[16/9] w-full bg-black">
                {opened.type === "image" ? (
                  <Image
                    src={opened.src}
                    alt={opened.alt ?? `Expanded ${openIndex + 1}`}
                    fill
                    className="object-contain"
                    quality={95}
                    priority
                  />
                ) : (
                  <video
                    className="h-full w-full object-contain"
                    src={opened.src}
                    poster={opened.poster}
                    controls
                    autoPlay
                    playsInline
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((v) => (v === null ? null : (v - 1 + safeItems.length) % safeItems.length))
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  ← Anterior
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((v) => (v === null ? null : (v + 1) % safeItems.length))
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

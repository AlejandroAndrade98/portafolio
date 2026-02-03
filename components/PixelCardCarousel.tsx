"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PixelCard from "@/components/reactbits/PixelCard";

type CardVariant = "default" | "blue" | "yellow" | "pink";

type CardItem = {
  id: string;
  variant?: string; // viene del JSON como string
  title: string;
  label: string;
  desc: string;
  img: string;
};

function normalizeVariant(v?: string): CardVariant {
  if (v === "blue" || v === "yellow" || v === "pink" || v === "default") return v;
  return "default";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getIsDesktop() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

export default function PixelCardCarousel({
  items,
  className = "",
}: {
  items: CardItem[];
  className?: string;
}) {
  const N = items.length;

  // ✅ Evita hydration mismatch: siempre 0 en server y primer render client
  const [active, setActive] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const normalized = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        variant: normalizeVariant(it.variant),
      })),
    [items]
  );

  // ✅ En desktop arrancar en la 2 (index 1) una vez montado
  useEffect(() => {
    if (N <= 1) return;

    const setInitial = () => {
      const next = getIsDesktop() ? 1 : 0;
      setActive((prev) => (prev === next ? prev : next));
    };

    setInitial();

    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setInitial();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else {
      // Safari / legacy
      (mq as MediaQueryList).addListener(onChange);
      return () => (mq as MediaQueryList).removeListener(onChange);
    }
  }, [N]);

  const applyTransform = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || N === 0) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-pc-card]"));
    if (!cards.length) return;

    const idx = clamp(active, 0, cards.length - 1);
    const activeEl = cards[idx];

    // ✅ Más estable que calcular "idx*(cardW+gap)" (porque widths pueden variar por breakpoints)
    const viewportW = viewport.getBoundingClientRect().width;
    const cardRect = activeEl.getBoundingClientRect();
    const cardW = cardRect.width;

    // offsetLeft es relativo al track (sin transform aplicado)
    const cardLeft = activeEl.offsetLeft;

    // Queremos que el centro del card quede en el centro del viewport
    const x = viewportW / 2 - cardW / 2 - cardLeft;

    track.style.transform = `translate3d(${x}px,0,0)`;
  }, [active, N]);

  // ✅ Centrar al cambiar active / resize
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || N === 0) return;

    let rafId = 0;
    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyTransform();
      });
    };

    // primera vez
    schedule();

    const ro = new ResizeObserver(() => schedule());
    ro.observe(viewport);

    // por si cambian fuentes/medidas en caliente
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("orientationchange", schedule);
    };
  }, [applyTransform, N]);

  // ✅ Si items cambian y active queda fuera de rango, corrige
useEffect(() => {
  if (N === 0) return;

  const raf = requestAnimationFrame(() => {
    setActive((prev) => {
      const next = clamp(prev, 0, N - 1);
      return prev === next ? prev : next;
    });
  });

  return () => cancelAnimationFrame(raf);
}, [N]);

  const prev = useCallback(() => {
    setActive((v) => (N ? (v - 1 + N) % N : 0));
  }, [N]);

  const next = useCallback(() => {
    setActive((v) => (N ? (v + 1) % N : 0));
  }, [N]);

  return (
    <div className={["relative", className].join(" ")}>
      <div ref={viewportRef} className="relative mx-auto max-w-[1100px] overflow-hidden">
        {/* máscara suave */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10
          [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        />

        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform transition-transform duration-500 ease-out py-2"
        >
          {normalized.map((c, i) => (
            <div
              key={c.id}
              data-pc-card
              className="shrink-0 w-[320px] sm:w-[360px] lg:w-[440px] xl:w-[480px]"
            >
              <PixelCard
                variant={c.variant}
                active={i === active}
                className="h-[260px] sm:h-[280px] lg:h-[300px]"
              >
                <div className="pc-toptext">
                  <div className="pc-details">
                    <p className="text-white/60 text-sm tracking-[0.2em] uppercase">
                      {c.label}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white/90">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-white/70">{c.desc}</p>
                  </div>
                </div>
              </PixelCard>
            </div>
          ))}
        </div>

        {/* Flechas */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white/80 hover:bg-black/55 transition"
            aria-label="Anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white/80 hover:bg-black/55 transition"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

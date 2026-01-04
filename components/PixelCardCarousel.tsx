"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const [containerW, setContainerW] = useState(0);
  const [cardW, setCardW] = useState(0);

  // 1) isDesktop arranca desde matchMedia (client-safe)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => getIsDesktop());

  // 2) index arranca: desktop = 1, mobile = 0
  const [index, setIndex] = useState<number>(() => {
    const start = getIsDesktop() ? 1 : 0;
    return N ? mod(start, N) : 0;
  });

  // Para no resetear el index después de que el usuario ya movió el carrusel
  const hasUserInteracted = useRef(false);

  const gap = isDesktop ? 24 : 12;

  // Detecta cambios de breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);

    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Si items llegan después o cambian de tamaño, y el usuario NO ha interactuado,
  // aplicamos el start correcto (desktop:1 / mobile:0).
  useEffect(() => {
    if (!N) return;

    // Si el usuario ya tocó el carrusel, solo aseguramos que el index siga siendo válido.
    if (hasUserInteracted.current) {
      setIndex((v) => mod(v, N));
      return;
    }

    const start = isDesktop ? 1 : 0;
    setIndex(mod(start, N));
  }, [N, isDesktop]);

  // Medición
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      const cw = containerRef.current?.getBoundingClientRect().width ?? 0;
      const w = firstCardRef.current?.getBoundingClientRect().width ?? 0;
      setContainerW(cw);
      setCardW(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    if (firstCardRef.current) ro.observe(firstCardRef.current);

    return () => ro.disconnect();
  }, []);

  const stride = cardW + gap;

  const translateX = useMemo(() => {
    if (!containerW || !cardW || !N) return 0;

    const centerX = containerW / 2;

    if (!isDesktop) {
      const cardCenter = index * stride + cardW / 2;
      return centerX - cardCenter;
    }

    // En desktop se centra el "par" (index y index+1)
    const pairMid = index * stride + cardW + gap / 2;
    return centerX - pairMid;
  }, [containerW, cardW, gap, index, isDesktop, stride, N]);

  const centers = useMemo(() => {
    if (!N) return new Set<number>();
    if (!isDesktop) return new Set([mod(index, N)]);
    return new Set([mod(index, N), mod(index + 1, N)]);
  }, [index, isDesktop, N]);

  const forcedActive = useMemo(() => {
    const s = new Set<number>();
    if (!N) return s;

    if (!isDesktop) {
      s.add(mod(index - 1, N));
      s.add(mod(index + 1, N));
      return s;
    }

    s.add(mod(index - 1, N));
    s.add(mod(index + 2, N));
    return s;
  }, [index, isDesktop, N]);

  const prev = () => {
    if (!N) return;
    hasUserInteracted.current = true;
    setIndex((v) => mod(v - 1, N));
  };

  const next = () => {
    if (!N) return;
    hasUserInteracted.current = true;
    setIndex((v) => mod(v + 1, N));
  };

  const drag = useRef({
    down: false,
    startX: 0,
    startTranslate: 0,
    currentTranslate: 0,
    pointerId: -1,
  });

  const [dragTranslate, setDragTranslate] = useState<number | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !N) return;
    hasUserInteracted.current = true;

    drag.current.down = true;
    drag.current.startX = e.clientX;
    drag.current.startTranslate = translateX;
    drag.current.currentTranslate = translateX;
    drag.current.pointerId = e.pointerId;

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    const t = drag.current.startTranslate + dx;
    drag.current.currentTranslate = t;
    setDragTranslate(t);
  };

  const onPointerUp = () => {
    if (!drag.current.down) return;
    drag.current.down = false;

    if (!containerW || !cardW || !N) {
      setDragTranslate(null);
      return;
    }

    const t = drag.current.currentTranslate;
    const centerX = containerW / 2;

    let k = 0;
    if (!isDesktop) {
      k = Math.round((centerX - t - cardW / 2) / stride);
    } else {
      k = Math.round((centerX - t - (cardW + gap / 2)) / stride);
    }

    setIndex(mod(k, N));
    setDragTranslate(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="flex items-stretch"
          style={{
            gap,
            transform: `translate3d(${dragTranslate ?? translateX}px,0,0)`,
            transition: dragTranslate === null ? "transform 420ms cubic-bezier(.2,.9,.2,1)" : "none",
            willChange: "transform",
            paddingInline: isDesktop ? 24 : 6,
          }}
        >
          {items.map((it, i) => {
            const isCenter = centers.has(i);
            const isForced = forcedActive.has(i);

            return (
              <div
                key={it.id}
                ref={i === 0 ? firstCardRef : null}
                className={[
                  "shrink-0",
                  "w-[68vw] max-w-[320px] sm:w-[54vw] sm:max-w-[360px] lg:w-[380px] xl:w-[420px]",
                  "transition-all duration-300",
                  isCenter ? "opacity-100 blur-0 scale-100" : "opacity-90 blur-[0.8px] scale-[0.97]",
                ].join(" ")}
              >
                <PixelCard
                  variant={normalizeVariant(it.variant)}
                  active={isForced && !isCenter}
                  className="h-[290px] sm:h-[360px] lg:h-[400px]"
                >
                  <div className="absolute inset-0 z-[1]">
                    <Image
                      src={it.img}
                      alt={it.title}
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 56vw, 420px"
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80" />
                  </div>

                  <div className="absolute inset-0 z-[2] flex flex-col justify-end p-6">
                    <p className="text-xs uppercase tracking-widest text-white/70">{it.label}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{it.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{it.desc}</p>
                  </div>
                </PixelCard>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none mt-5 flex justify-center gap-3 lg:mt-6">
        <button
          onClick={prev}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60"
        >
          ←
        </button>
        <button
          onClick={next}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60"
        >
          →
        </button>
      </div>
    </div>
  );
}

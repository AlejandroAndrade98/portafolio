// app/page.tsx
"use client";

import Image from "next/image";
import type * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { RadialIntro } from "@/components/animate-ui/components/communityHome/radial-intro";
import MagicBento from "@/components/animate-ui/MagicBento";

import { orbitItems } from "@/lib/heroOrbitItems";

import ScrollReveal from "@/components/animate-ui/ScrollReveal";
import about from "@/content/about.json";

import LightPillar from "@/components/animate-ui/LightPillar";
import LightRays from "@/components/animate-ui/LightRays";

import ProfileCard from "@/components/ProfileCard";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // lg = 1024px
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarse(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  

  // ✅ ORBITAL MOBILE (solo < lg)
  const ORBIT_STEP = 120; // 360 / 3
  const ORBIT_COUNT = 3;
  const ORBIT_RADIUS = 520; // profundidad del carrusel

  const orbitStageRef = useRef<HTMLDivElement | null>(null);

  const orbitDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startAngle: -ORBIT_STEP, // inicia en el panel central (Profile)
    lock: "" as "" | "x" | "y",
    captured: false,
  });

  const [orbitDragging, setOrbitDragging] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(-ORBIT_STEP); // Profile al frente
  const orbitAngleRef = useRef(-ORBIT_STEP);

  const [orbitActive, setOrbitActive] = useState(1); // 0=Magic 1=Profile 2=Radial

  useEffect(() => {
  if (!isMobile) return;

  if (orbitActive === 0) {
    // ✅ fuerza repaint/medición del glow al quedar al frente
    window.dispatchEvent(new Event("mb:recalc"));
  }
}, [orbitActive, isMobile]);

  // ✅ En mobile/tablet inicia en Profile (panel central)
useEffect(() => {
  // lg = 1024px
  const mq = window.matchMedia("(max-width: 1024px)");

  const update = () => {
    const nextIsMobile = mq.matches;

    setIsMobile(nextIsMobile);

    // ✅ En mobile/tablet, arrancar en el panel del centro (ProfileCard)
    if (nextIsMobile) {
      setOrbitAngle(-ORBIT_STEP);
      orbitAngleRef.current = -ORBIT_STEP;
      setOrbitActive(1);

      orbitDragRef.current.startAngle = -ORBIT_STEP;
      orbitDragRef.current.lock = "";
      orbitDragRef.current.active = false;
      orbitDragRef.current.captured = false;
    }
  };

  update();
  mq.addEventListener?.("change", update);
  return () => mq.removeEventListener?.("change", update);
}, []);

  const orbitIndexFromAngle = (angle: number) => {
    const step = ORBIT_STEP;
    const snapped = Math.round(angle / step) * step;
    const idx = (((-snapped / step) % ORBIT_COUNT) + ORBIT_COUNT) % ORBIT_COUNT;
    return { snapped, idx };
  };

  const snapOrbitToAngle = (nextAngle: number) => {
    const { snapped, idx } = orbitIndexFromAngle(nextAngle);
    setOrbitAngle(snapped);
    orbitAngleRef.current = snapped;
    setOrbitActive(idx);
    orbitDragRef.current.startAngle = snapped;
  };

  const handleOrbitPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    orbitDragRef.current.active = true;
    orbitDragRef.current.pointerId = e.pointerId;
    orbitDragRef.current.startX = e.clientX;
    orbitDragRef.current.startY = e.clientY;
    orbitDragRef.current.startAngle = orbitAngleRef.current;
    orbitDragRef.current.lock = "";
    orbitDragRef.current.captured = false;

    // No activamos drag aún - dejamos que un tap normal funcione.
    setOrbitDragging(false);
  };

  const handleOrbitPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    if (!orbitDragRef.current.active) return;

    const el = orbitStageRef.current;
    if (!el) return;

    const dx = e.clientX - orbitDragRef.current.startX;
    const dy = e.clientY - orbitDragRef.current.startY;

    // ✅ Decide eje después de un pequeño umbral
    if (!orbitDragRef.current.lock) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const TH = 8; // px

      if (ax < TH && ay < TH) return;

      orbitDragRef.current.lock = ax > ay ? "x" : "y";

      // Solo si es drag horizontal, capturamos y activamos arrastre
      if (orbitDragRef.current.lock === "x") {
        const target = e.currentTarget as HTMLDivElement;
        target.setPointerCapture?.(e.pointerId);
        orbitDragRef.current.captured = true;
        setOrbitDragging(true);
      } else {
        // si el usuario está haciendo scroll vertical, no hacemos nada
        return;
      }
    }

    if (orbitDragRef.current.lock !== "x") return;

    // ✅ Arrastrar 1 ancho de pantalla ≈ 1 salto (120deg)
    const width = Math.max(1, el.clientWidth);
    const next =
      orbitDragRef.current.startAngle + (dx / width) * ORBIT_STEP;

    // Evita que el gesto horizontal compita con scroll
    e.preventDefault();

    orbitAngleRef.current = next;
    setOrbitAngle(next);

    // ✅ panel activo aproximado durante drag para controlar pointer-events
    const approx = orbitIndexFromAngle(next);
    setOrbitActive(approx.idx);
  };

  const handleOrbitPointerUp = () => {
    if (!isMobile) return;
    if (!orbitDragRef.current.active) return;

    orbitDragRef.current.active = false;

    // Si nunca fue drag horizontal, fue tap o scroll vertical - no “snapeamos”
    if (orbitDragRef.current.lock !== "x") {
      orbitDragRef.current.lock = "";
      orbitDragRef.current.captured = false;
      setOrbitDragging(false);
      return;
    }

    orbitDragRef.current.lock = "";
    orbitDragRef.current.captured = false;
    setOrbitDragging(false);

    snapOrbitToAngle(orbitAngleRef.current);
  };

  useLayoutEffect(() => {
    // ✅ En móvil/touch, normalizeScroll suele dar comportamientos raros (saltos/overscroll).
    const isCoarse =
      ScrollTrigger.isTouch || window.matchMedia("(pointer: coarse)").matches;

    if (!isCoarse) ScrollTrigger.normalizeScroll(true);

    if (!mainRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set("#fade-layer", { opacity: 0 });

      gsap.set("#ambient-bg", { autoAlpha: 0, y: 0, filter: "blur(0px)" });
      gsap.set("#logo-mask", { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#hero-key", { autoAlpha: 1, opacity: 1, scale: 1 });

      gsap.set("#hero-overlay", {
        autoAlpha: 1,
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      });

      gsap.set("#about-bg", { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: "#intro",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            if (self.direction === -1) {
              gsap.set("#fade-layer", { opacity: 0 });
            }
          },
        },
      });

      tl.to("#hero-key", { scale: 1, duration: 1 }, 0);
      tl.to(
        "#hero-overlay",
        { autoAlpha: 0, y: -10, filter: "blur(10px)", duration: 1 },
        "<"
      );

      tl.to("#ambient-bg", { autoAlpha: 1, duration: 0.6 }, 0.25);


      const maskAt = isMobile ? 0.30 : 0.3;
      tl.to(
        "#logo-mask",
        {
          maskSize: "clamp(60vh, 20%, 30vh)",
          webkitMaskSize: "clamp(60vh, 20%, 30vh)",
          duration: 0.6,
        }, maskAt  
      );

      
      tl.to("#hero-key", { opacity: 0, duration: 0.4 }, 0.5);

      tl.to("#fade-layer", { opacity: 1, duration: 0.22 }, 1.02);

      tl.to(
        "#logo-mask",
        { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.32 },
        1.05
      );
      tl.to(
        "#ambient-bg",
        { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.32 },
        1.05
      );

      tl.to("#about-bg", { autoAlpha: 1, duration: 0.55 }, 1.1);

      tl.set("#logo-mask", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#ambient-bg", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#hero-overlay", { y: 0, filter: "blur(0px)" }, 1.32);

      tl.to("#fade-layer", { opacity: 0, duration: 0.32 }, 1.26);

      gsap.fromTo(
        "#about-content",
        { opacity: 0, y: 30, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          scrollTrigger: {
            trigger: "#about",
            start: "top 78%",
            end: "top 55%",
            scrub: 2,
          },
        }
      );
    }, mainRef);

    return () => {
      ScrollTrigger.normalizeScroll(false);
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <main ref={mainRef} className="relative">
      <section id="intro" className="relative h-[200vh]">
        <div
          id="fade-layer"
          className="fixed inset-0 z-[999] bg-black pointer-events-none"
          style={{ opacity: 0 }}
        />

        <div
          id="ambient-bg"
          className="fixed inset-0 z-0 opacity-0 pointer-events-none"
        >
          <div className="absolute inset-0">
            <LightPillar
              topColor="#4F46E5"
              bottomColor="#22D3EE"
              intensity={1.15}
              glowAmount={0.006}
              noiseIntensity={0.35}
              rotationSpeed={0.25}
              pillarWidth={3.2}
              pillarHeight={0.45}
              mixBlendMode="screen"
              interactive={false}
            />
          </div>
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div id="logo-mask" className="fixed inset-0 z-10 w-full h-screen">
          <section className="h-screen">
            <div
              id="hero-key"
              className="fixed inset-0 h-screen scale-125 overflow-hidden"
            >
              <div className="relative block w-full h-full">
                <BubbleBackground
                  id="hero-bubbles"
                  interactive={false}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-black/55" />
              </div>
            </div>
          </section>
        </div>

        {/* ✅ HERO OVERLAY (repartido + responsive real) */}
        <div id="hero-overlay" className="fixed inset-0 z-20 pointer-events-auto">
          {/* Contenedor centrado */}
          <div className="mx-auto w-full max-w-6xl h-screen px-4 sm:px-6 lg:px-12">
            {/* ✅ MOBILE/TABLET: orbital 3D (MagicBento | Profile | Radial) */}
            <div className="lg:hidden h-full pt-24 pb-10 overflow-hidden">
              <div className="relative h-full w-full [perspective:1200px]">
                {/* Stage - captura drag horizontal sin romper scroll vertical */}
                <div
                  ref={orbitStageRef}
                  className="absolute inset-0"
                  onPointerDown={handleOrbitPointerDown}
                  onPointerMove={handleOrbitPointerMove}
                  onPointerUp={handleOrbitPointerUp}
                  onPointerCancel={handleOrbitPointerUp}
                  style={{ touchAction: "pan-y" }}
                >
                  {/* Carousel */}
                  <div
                    className={[
                      "relative w-full h-full will-change-transform [transform-style:preserve-3d]",
                      orbitDragging ? "" : "transition-transform duration-500 ease-out",
                    ].join(" ")}
                    style={{
                      transform: `translateZ(-${ORBIT_RADIUS}px) rotateY(${orbitAngle}deg)`,
                    }}
                  >
                    {/* 0) MagicBento */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotateY(0deg) translateZ(${ORBIT_RADIUS}px)`,
                        pointerEvents: orbitActive === 0 ? "auto" : "none",
                        opacity: orbitActive === 0 ? 1 : 0.35,
                        filter: orbitActive === 0 ? "none" : "blur(1.5px)",
                      }}
                    >
                      <div className="w-[min(520px,92vw)] origin-center scale-[0.92] sm:scale-100 [@media(max-height:700px)]:scale-[0.84]">
                        <MagicBento
                        glowColor="168, 85, 247"            // hover
                        enableIdleGlow
                        idleGlowColor="34, 211, 238"        

                        idleGlowIntensity={0.22}
                        idleSpeed={0.65}
                        idlePadding={28}
                        enableSpotlight
                        enableBorderGlow
                        enableTilt
                        enableMagnetism
                        clickEffect
                        enableStars
                        particleCount={7}
                        textAutoHide
                        spotlightRadius={320}
                          cards={[
                            {
                              id: "about",
                              label: "About",
                              title: "Sobre mí",
                              description: "Quién soy, qué construyo y cómo pienso.",
                              targetSelector: "#about",
                              color: "rgba(5, 10, 25, 0.55)",
                            },
                            {
                              id: "stack",
                              label: "Stack",
                              title: "Tecnologías",
                              description: "Next.js, React, Node, AWS, MySQL, Prisma…",
                              targetSelector: "#stack",
                              color: "rgba(5, 10, 25, 0.55)",
                            },
                            {
                              id: "projects",
                              label: "Projects",
                              title: "Proyectos",
                              description: "Spellbook, Embipos, Labs y más.",
                              targetSelector: "#projects",
                              color: "rgba(5, 10, 25, 0.55)",
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {/* 1) ProfileCard (CENTRO por defecto) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotateY(${ORBIT_STEP}deg) translateZ(${ORBIT_RADIUS}px)`,
                        pointerEvents: orbitActive === 1 ? "auto" : "none",
                        opacity: orbitActive === 1 ? 1 : 0.35,
                        filter: orbitActive === 1 ? "none" : "blur(1.5px)",
                      }}
                    >
                      <div className="w-[min(420px,92vw)] flex justify-center origin-center scale-[0.98] [@media(max-height:700px)]:scale-[0.9]">
                        <ProfileCard
                          name="Alejandro Andrade"
                          title="Software Developer"
                          handle="alejandroandrade"
                          status="Online"
                          contactText="Contact Me"
                          avatarUrl="/perfil.jpeg"
                          iconUrl="/profile-card/grain.png"
                          showUserInfo
                          enableTilt
                          enableMobileTilt={false}
                        />
                      </div>
                    </div>

                    {/* 2) RadialIntro */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotateY(${ORBIT_STEP * 2}deg) translateZ(${ORBIT_RADIUS}px)`,
                        pointerEvents: orbitActive === 2 ? "auto" : "none",
                        opacity: orbitActive === 2 ? 1 : 0.35,
                        filter: orbitActive === 2 ? "none" : "blur(1.5px)",
                      }}
                    >
                      <div className="w-[min(520px,92vw)] flex justify-center">
                        <div className="origin-center scale-[0.86] sm:scale-[0.95] [@media(max-height:700px)]:scale-[0.78]">
                          <RadialIntro orbitItems={orbitItems} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dots nav (no interfiere con el drag) */}
                <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      aria-label={`Panel ${i + 1}`}
                      onClick={() => snapOrbitToAngle(-i * ORBIT_STEP)}
                      className={[
                        "h-2.5 w-2.5 rounded-full transition-all",
                        orbitActive === i ? "bg-white" : "bg-white/30",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ DESKTOP: exactamente igual a tu layout actual (NO se toca visualmente) */}
            <div className="hidden lg:flex h-full items-center justify-center">
              {/* Mobile: stack.  LG+: fila centrada con gaps */}
              <div className="grid gap-8 lg:flex lg:items-center lg:justify-center lg:gap-16 xl:gap-24">
                {/* 1) Magic Bento (izquierda) */}
                <div className="w-full max-w-[520px] lg:w-[clamp(360px,28vw,520px)] lg:max-w-none lg:shrink-0">
                  <MagicBento
                    glowColor="168, 85, 247"
                    idleGlowColor="34, 211, 238"
                    enableStars
                    enableSpotlight
                    enableBorderGlow
                    enableTilt
                    enableMagnetism
                    clickEffect
                    textAutoHide
                    spotlightRadius={280}
                    particleCount={10}
                    cards={[
                      {
                        id: "about",
                        label: "About",
                        title: "Sobre mí",
                        description: "Quién soy, qué construyo y cómo pienso.",
                        targetSelector: "#about",
                        color: "rgba(5, 10, 25, 0.55)",
                      },
                      {
                        id: "stack",
                        label: "Stack",
                        title: "Tecnologías",
                        description: "Next.js, React, Node, AWS, MySQL, Prisma…",
                        targetSelector: "#stack",
                        color: "rgba(5, 10, 25, 0.55)",
                      },
                      {
                        id: "projects",
                        label: "Projects",
                        title: "Proyectos",
                        description: "Spellbook, Embipos, Labs y más.",
                        targetSelector: "#projects",
                        color: "rgba(5, 10, 25, 0.55)",
                      },
                    ]}
                  />
                </div>

                {/* 2) ProfileCard (centro) */}
                <div className="w-full max-w-[420px] lg:w-[clamp(320px,24vw,420px)] lg:max-w-none lg:shrink-0 flex justify-center">
                  <ProfileCard
                    name="Alejandro Andrade"
                    title="Software Developer"
                    handle="alejandroandrade"
                    status="Online"
                    contactText="Contact Me"
                    avatarUrl="/perfil.jpeg"
                    iconUrl="/profile-card/grain.png"
                    showUserInfo
                    enableTilt
                    enableMobileTilt={false}
                  />
                </div>

                {/* 3) Radial Intro (derecha) */}
                <div className="w-full lg:w-[clamp(360px,28vw,520px)] lg:shrink-0 flex justify-center">
                  <div className="scale-[0.9] xl:scale-100">
                    <RadialIntro orbitItems={orbitItems} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Header SIEMPRE visible (responsive padding) */}
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-between h-screen w-full pointer-events-none px-4 py-6 sm:px-10 sm:py-10 lg:px-20 lg:py-16">
        <header className="flex justify-between w-full pointer-events-auto">
<Image
  src="/AlejandroAndrade.svg"
  alt="Perfil"
  width={512}
  height={512}
  className="w-48 h-auto"   // o w-[...] h-auto
  style={{ height: "auto" }}
/>
          <p>Menu</p>
        </header>
        </div>
      </section>

      {/* Background global para ABOUT */}
      <div
        id="about-bg"
        className="fixed inset-0 z-[1] pointer-events-none opacity-0"
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#38BDF8"
          raysSpeed={1.35}
          lightSpread={0.7}
          rayLength={1.65}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.12}
          distortion={0.06}
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <section id="about" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <div id="about-content" className="relative z-10">
          <ScrollReveal
            as="h2"
            className="text-4xl font-semibold tracking-tight"
            baseOpacity={0}
            enableBlur
            blurStrength={12}
            baseRotation={2}
          >
            {about.title}
          </ScrollReveal>

          <div className="mt-6 space-y-5 text-white/80 leading-relaxed text-lg">
            {about.paragraphs.map((p, idx) => (
              <ScrollReveal
                key={idx}
                as="p"
                className="block"
                baseOpacity={0}
                enableBlur
                blurStrength={20}
                baseRotation={3}
                y={20}
              >
                {p}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Stack</h2>
        <p className="mt-6 text-white/70 text-lg">
          Next.js — React — Tailwind — Node — AWS — MySQL — Prisma.
        </p>
      </section>

      <section id="projects" className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Projects</h2>
        <p className="mt-6 text-white/70 text-lg">
          Spellbook — Embipos — Troubleshoot-Labs — Propel.
        </p>
      </section>
    </main>
  );
}

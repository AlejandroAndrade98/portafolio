"use client";

import * as React from "react";
import Image from "next/image";

import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { RadialIntro } from "@/components/animate-ui/components/communityHome/radial-intro";
import MagicBento from "@/components/animate-ui/MagicBento";
import LightPillar from "@/components/animate-ui/LightPillar";
import ProfileCard from "@/components/ProfileCard";

import type { Orbit3DController } from "@/hooks/useOrbit3D";
import type { orbitItems as orbitItemsType } from "@/lib/heroOrbitItems";

type IntroSectionProps = {
  hero: typeof import("@/content/home/hero.json");
  orbitItems: typeof orbitItemsType;
  orbit: Orbit3DController;
};

export default function IntroSection({ hero, orbitItems, orbit }: IntroSectionProps) {
  const {
    ORBIT_STEP,
    ORBIT_RADIUS,
    orbitDragging,
    orbitAngle,
    orbitActive,
    snapOrbitToAngle,
    setOrbitStageEl,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = orbit;

  return (
    <section id="intro" className="relative h-[200vh]">
      <div
        id="fade-layer"
        className="fixed inset-0 z-[999] bg-black pointer-events-none"
        style={{ opacity: 0 }}
      />

      <div id="ambient-bg" className="fixed inset-0 z-0 opacity-0 pointer-events-none">
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
          <div id="hero-key" className="fixed inset-0 h-screen scale-125 overflow-hidden">
            <div className="relative block w-full h-full">
              <BubbleBackground id="hero-bubbles" interactive={false} className="absolute inset-0" />
              <div className="absolute inset-0 bg-black/55" />
            </div>
          </div>
        </section>
      </div>

      <div id="hero-overlay" className="fixed inset-0 z-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-6xl h-screen px-4 sm:px-6 lg:px-12">
          {/* MOBILE/TABLET */}
          <div className="lg:hidden h-full pt-24 pb-10 overflow-hidden">
            <div className="relative h-full w-full [perspective:1200px]">
              <div
                ref={setOrbitStageEl}
                className="absolute inset-0"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "pan-y" }}
              >
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
                        glowColor="168, 85, 247"
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
                        cards={hero.magicBentoCards}
                      />
                    </div>
                  </div>

                  {/* 1) ProfileCard */}
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
                      <ProfileCard {...hero.profileCard} />
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

              {/* dots */}
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

          {/* DESKTOP */}
          <div className="hidden lg:flex h-full items-center justify-center">
            <div className="grid gap-8 lg:flex lg:items-center lg:justify-center lg:gap-16 xl:gap-24">
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
                  cards={hero.magicBentoCards}
                />
              </div>

              <div className="w-full max-w-[420px] lg:w-[clamp(320px,24vw,420px)] lg:max-w-none lg:shrink-0 flex justify-center">
                <ProfileCard {...hero.profileCard} />
              </div>

              <div className="w-full lg:w-[clamp(360px,28vw,520px)] lg:shrink-0 flex justify-center">
                <div className="scale-[0.9] xl:scale-100">
                  <RadialIntro orbitItems={orbitItems} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header fijo */}
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-between h-screen w-full pointer-events-none px-4 py-6 sm:px-10 sm:py-10 lg:px-20 lg:py-16">
        <header className="flex justify-between w-full pointer-events-auto">
          <Image
            src={hero.header.logo.src}
            alt={hero.header.logo.alt}
            width={hero.header.logo.width}
            height={hero.header.logo.height}
            className="w-48 h-auto"
            style={{ height: "auto" }}
          />
          <p>{hero.header.rightText}</p>
        </header>
      </div>
    </section>
  );
}

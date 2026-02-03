"use client";

import * as React from "react";
import Image from "next/image";

import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";

import type { Orbit3DController } from "@/hooks/useOrbit3D";
import type { orbitItems as orbitItemsType } from "@/lib/heroOrbitItems";

type IntroSectionProps = {
  hero: typeof import("@/content/home/hero.json");
  orbitItems: typeof orbitItemsType;
  orbit: Orbit3DController;
};

export default function IntroSection({ hero }: IntroSectionProps) {
  return (
    <section id="intro" className="relative h-[200vh]">
      <div
        id="ambient-bg"
        className="fixed inset-0 z-0 opacity-0 pointer-events-none"
      />

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

      {/* Overlay (se deja el contenedor intacto, pero sin los 3 componentes) */}
      <div id="hero-overlay" className="fixed inset-0 z-20 pointer-events-auto">
        <div className="mx-auto w-full max-w-6xl h-screen px-4 sm:px-6 lg:px-12">
          {/* Intencionalmente vacío por ahora */}
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

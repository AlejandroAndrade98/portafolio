"use client";

import ScrollReveal from "@/components/animate-ui/ScrollReveal";
import LightRays from "@/components/animate-ui/LightRays";
import PixelCardCarousel from "@/components/PixelCardCarousel";

type AboutData = typeof import("@/content/home/about.json");
type PixelCardsData = typeof import("@/content/home/aboutPixelCards.json");

type AboutSectionProps = {
  about: AboutData;
  pixelCards: PixelCardsData;
};

export default function AboutSection({ about, pixelCards }: AboutSectionProps) {
  return (
    <>
      {/* bg global */}
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

      <section id="about" className="relative z-10 mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl px-8 py-24">
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

          <div className="mt-6 space-y-5 text-lg leading-relaxed text-white/80">
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

          <PixelCardCarousel className="mt-12" items={pixelCards} />
        </div>
      </section>
    </>
  );
}

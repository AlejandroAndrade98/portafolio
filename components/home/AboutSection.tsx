"use client";

import ScrollReveal from "@/components/animate-ui/ScrollReveal";
import LightRays from "@/components/animate-ui/LightRays";
// import PixelCardCarousel from "@/components/PixelCardCarousel";

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

      <section
        id="about"
        className="relative z-10 mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl px-6 sm:px-8 pt-24 pb-0"
      >
        <div id="about-content" className="relative z-10">
<ScrollReveal
  as="h2"
  className="
    text-center font-semibold tracking-tight text-sky-200/90
    drop-shadow-[0_0_18px_rgba(56,189,248,0.25)]
    [&_.scroll-reveal-text]:text-[2.35rem]
    sm:[&_.scroll-reveal-text]:text-4xl
    lg:[&_.scroll-reveal-text]:text-5xl
    [&_.scroll-reveal-text]:leading-[1.1]
  "
  baseOpacity={0}
  enableBlur
  blurStrength={12}
  baseRotation={2}
>
  {about.title}
</ScrollReveal>

          <div className="mt-24 space-y-6 text-[1.15rem] leading-relaxed text-white/80">
            {about.paragraphs.map((p, idx) => (
              <ScrollReveal
                key={idx}
                as="p"
                className="
  text-[1.55rem] leading-[1.35] font-medium text-cyan-100/90
  sm:text-[2.05rem]
  lg:text-[2.35rem]
"
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

          {/* <div className="mt-24">
            <PixelCardCarousel items={pixelCards} />
          </div> */}

          {/* Sentinel para iniciar el fade ANTES de que se vea Projects */}
          <div id="about-exit" aria-hidden className="h-[14vh] sm:h-[18vh] lg:h-[22vh] w-full" />
        </div>
      </section>
    </>
  );
}

// app/page.tsx
"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { RadialIntro } from "@/components/animate-ui/components/communityHome/radial-intro";
// import { RadialNav } from "@/components/animate-ui/components/communityHome/radial-nav";
import MagicBento from "@/components/animate-ui/MagicBento";

import { orbitItems } from "@/lib/heroOrbitItems";
// import { heroNavItems, heroNavTargets } from "@/lib/heroNavItems";

import ScrollReveal from "@/components/animate-ui/ScrollReveal";
import about from "@/content/about.json";

// Mis backgrounds // para las diferentes secciones.
import LightPillar from "@/components/animate-ui/LightPillar";
import LightRays from "@/components/animate-ui/LightRays";

import ProfileCard from "@/components/ProfileCard"

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    ScrollTrigger.normalizeScroll(true);

    if (!mainRef.current) return;

    // gsap.context ayuda a limpiar animaciones en hot reload
    const ctx = gsap.context(() => {
      // ✅ sets aquí adentro (ya existe el DOM)
      // fade-layer inicia transparente para que el primer frame se vea a full color
      gsap.set("#fade-layer", { opacity: 0 });

      // capas del intro
      gsap.set("#ambient-bg", { autoAlpha: 0, y: 0, filter: "blur(0px)" });
      gsap.set("#logo-mask", { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#hero-key", { autoAlpha: 1, opacity: 1, scale: 1 });

      // ✅ Nuevo: overlay visible al inicio (RadialIntro + RadialNav)
      gsap.set("#hero-overlay", { autoAlpha: 1, opacity: 1, y: 0, filter: "blur(0px)" });

      // ✅ Background global para ABOUT (para crossfade suave)
      gsap.set("#about-bg", { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: "#intro",
          start: "top top",
          end: "bottom top",
          scrub: 1,

          onUpdate: (self) => {
            // ✅ Si el usuario va hacia arriba, no permitas que la cortina negra tape el hero
            if (self.direction === -1) {
              gsap.set("#fade-layer", { opacity: 0 });
            }
          },
        },
      });

      // 1) Hero (background) + overlay
      tl.to("#hero-key", { scale: 1, duration: 1 }, 0);

      // ✅ Antes: #hero-key-logo se desvanecía.
      // ✅ Ahora: desvanecemos el overlay completo (RadialIntro + RadialNav) en el MISMO momento.
      tl.to("#hero-overlay", { autoAlpha: 0, y: -10, filter: "blur(10px)", duration: 1 }, "<");

      // Ambient background para que no quede “solo”
      tl.to("#ambient-bg", { autoAlpha: 1, duration: 0.6 }, 0.25);

      // Máscara
      tl.to("#logo-mask", { maskSize: "clamp(60vh, 20%, 30vh)", duration: 0.6 }, 0.3);

      // Apaga el hero (solo el hero), deja el ambient + máscara
      tl.to("#hero-key", { opacity: 0, duration: 0.4 }, 0.5);

      // 2) Vuelve a negro (corte tipo GTA)
      // Encendemos la cortina negra para hacer el cambio sin que se note
      // ✅ CORRECCIÓN: recortamos el tramo negro para que no se sienta tan largo
      tl.to("#fade-layer", { opacity: 1, duration: 0.22 }, 1.02);

      // 3) Ya en negro: desvanecer el intro hacia arriba (gradual, no set)
      tl.to("#logo-mask", { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.32 }, 1.05);
      tl.to("#ambient-bg", { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.32 }, 1.05);

      // ✅ También aseguramos que el overlay quede “apagado” (por si vuelves a scrollear)
      // tl.to("#hero-overlay", { autoAlpha: 0, duration: 0.2 }, 1.2);

      // ✅ CORRECCIÓN: encendemos el fondo del ABOUT ANTES de bajar el negro (crossfade real)
      tl.to("#about-bg", { autoAlpha: 1, duration: 0.55 }, 1.10);

      // (opcional) resetea posición/blur para la próxima vez que se muestre (hot reload / re-scroll)
      // ✅ CORRECCIÓN: estos sets acortados para no alargar la duración total del timeline
      tl.set("#logo-mask", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#ambient-bg", { y: 0, filter: "blur(0px)" }, 1.32);
      tl.set("#hero-overlay", { y: 0, filter: "blur(0px)" }, 1.32);

      // 4) Negro -> revela siguiente sección (About) DESPUÉS del corte
      // Nota: About está en otra sección (#about) fuera del intro.
      // ✅ CORRECCIÓN: bajamos el negro más temprano y más rápido
      tl.to("#fade-layer", { opacity: 0, duration: 0.32 }, 1.26);

      // (Opcional) reveal elegante del contenido del About
      // Esto ya es independiente del intro, y corre cuando About entra al viewport.
      // ✅ CORRECCIÓN: animamos SOLO el contenido para no afectar el background fijo #about-bg
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

    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef} className="relative">
      {/* ✅ INTRO: Sección 1 (todo el efecto de máscara vive aquí)
          Esta altura controla cuánto scroll dura el intro */}
      <section id="intro" className="relative h-[200vh]">
        {/* ✅ Cortina negra (GTA)
            - Arranca en opacity 0 para no oscurecer el inicio
            - Luego la subimos a 1 para hacer el "corte" y después la bajamos para revelar el About */}
        <div
          id="fade-layer"
          className="fixed inset-0 z-[999] bg-black pointer-events-none"
          style={{ opacity: 0 }}
        />

        {/* ✅ Ambient background (solo durante el mask) */}
        <div id="ambient-bg" className="fixed inset-0 z-0 opacity-0 pointer-events-none">
          <div className="absolute inset-0">
            <LightPillar
              topColor="#4F46E5" // indigo
              bottomColor="#22D3EE" // cyan
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

          {/* Oscurece un poco para look premium y contraste */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* ✅ Capa enmascarada (intro)
            IMPORTANTE:
            Todo lo que esté dentro de #logo-mask será afectado por la máscara (mask-image).
            Por eso SOLO dejamos el background aquí adentro. */}
        <div id="logo-mask" className="fixed inset-0 z-10 w-full h-screen">
          <section className="h-screen">
            {/* Contenedor que se comporta como el "hero" del intro */}
            <div id="hero-key" className="fixed inset-0 h-screen scale-125 overflow-hidden">
              {/* ✅ Usamos div (NO picture) para poder meter overlays sin HTML inválido */}
              <div className="relative block w-full h-full">
                {/* ✅ Fondo animado */}
                <BubbleBackground
                  id="hero-bubbles"
                  interactive={false} // ponlo true si quieres que siga el mouse
                  className="absolute inset-0"
                />

                {/* ✅ Oscurece un poco para look más “premium” y mejor contraste */}
                <div className="absolute inset-0 bg-black/55" />
              </div>
            </div>
          </section>
        </div>

        {/* ✅ Overlay contenido (Radial Intro + Radial Nav)
            IMPORTANTE:
            Esto va FUERA de #logo-mask para que la máscara NO recorte el contenido.
            Si lo dejas dentro, cuando el mask-size se anime puede "comerse" tus componentes. */}

<div
  id="hero-overlay"
  className="fixed inset-0 z-20 flex items-center justify-center px-4 sm:px-6 lg:px-16 pointer-events-auto"
>
  <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
    {/* 1) Magic Bento */}
    <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
      <div className="w-full max-w-[520px]">
        <MagicBento
          glowColor="34, 211, 238"
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
    </div>

    {/* 2) ProfileCard (CENTRO) */}
    <div className="order-1 lg:order-2 flex justify-center">
      <div className="w-full max-w-[420px]">
      <ProfileCard
        name="Alejandro Andrade"
        title="Software Developer"
        handle="alejandroandrade"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/perfil.jpeg"

        iconUrl="/profile-card/grain.png"
        // grainUrl="/profile-card/icon.svg"
        showUserInfo
        enableTilt
        enableMobileTilt={false}
      />
      </div>
    </div>

    {/* 3) Radial Intro */}
    <div className="order-3 flex justify-center lg:justify-end">
      <div className="scale-[0.9] sm:scale-100">
        <RadialIntro orbitItems={orbitItems} />
      </div>
    </div>
  </div>
</div>


        {/* ✅ Header SIEMPRE visible */}
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-between h-screen px-20 p-16 w-full pointer-events-none">
          <header className="flex justify-between w-full pointer-events-auto">
            <Image src="/AlejandroAndrade.svg" alt="Logo" width={200} height={24} />
            <p>Menu</p>
          </header>
        </div>
      </section>

      {/* Background global para ABOUT (para crossfade suave) */}
      {/* ✅ CORRECCIÓN: lo movimos FUERA de #about para que NO herede opacity 0 */}
      <div id="about-bg" className="fixed inset-0 z-1 pointer-events-none opacity-0">
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

      {/* ✅ ABOUT: Sección 2 */}
      <section id="about" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        {/* Contenido arriba */}
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

      {/* ✅ STACK: Sección 3 */}
      <section id="stack" className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Stack</h2>
        <p className="mt-6 text-white/70 text-lg">
          Next.js — React — Tailwind — Node — AWS — MySQL — Prisma.
        </p>
      </section>

      {/* ✅ PROJECTS: Sección 4 */}
      <section id="projects" className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Projects</h2>
        <p className="mt-6 text-white/70 text-lg">
          Spellbook — Embipos — Troubleshoot-Labs — Propel.
        </p>
      </section>
    </main>
  );
}

// app/page.tsx
"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!mainRef.current) return;

    // gsap.context ayuda a limpiar animaciones en hot reload
    const ctx = gsap.context(() => {
      // ✅ sets aquí adentro (ya existe el DOM)
      // fade-layer inicia transparente para que el primer frame se vea a full color
      gsap.set("#fade-layer", { opacity: 0 });

      // capas del intro
      gsap.set("#ambient-bg", { opacity: 0, autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#logo-mask", { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set("#hero-key", { autoAlpha: 1, opacity: 1, scale: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          // ✅ MUY IMPORTANTE:
          // El timeline del intro se controla SOLO con la sección #intro
          // Así, cuando terminas de scrollear el intro, el timeline ya llegó al final.
          trigger: "#intro",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // 1) Negro -> empieza a revelar
      // (En tu caso NO empezamos en negro: empezamos a full color.
      // Usamos el negro más adelante como "corte tipo GTA".)

      // Hero / logo
      tl.to("#hero-key", { scale: 1, duration: 1 }, 0); // ejemplo: escala el picture
      tl.to("#hero-key-logo", { opacity: 0, duration: 1 }, "<"); // ejemplo: logo sube y desaparece

      // Ambient background para que no quede “solo”
      tl.to("#ambient-bg", { opacity: 1, duration: 0.6 }, 0.25);
      tl.to("#ambient-bg-img", { scale: 1, duration: 1 }, 0.25);

      // Máscara
      tl.to("#logo-mask", { maskSize: "clamp(60vh, 20%, 30vh)", duration: 0.6 }, 0.3);

      // Apaga el hero (solo el hero), deja el ambient + máscara
      tl.to("#hero-key", { opacity: 0, duration: 0.4 }, 0.5);

      // 2) Vuelve a negro (corte tipo GTA)
      // Encendemos la cortina negra para hacer el cambio sin que se note
      tl.to("#fade-layer", { opacity: 1, duration: 0.35 }, 1.15);

      // 3) Ya en negro: desvanecer el intro hacia arriba (gradual, no set)
      tl.to("#logo-mask", { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.45 }, 1.2);
      tl.to("#ambient-bg", { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.45 }, 1.2);

      // (opcional) resetea posición/blur para la próxima vez que se muestre (hot reload / re-scroll)
      tl.set("#logo-mask", { y: 0, filter: "blur(0px)" }, 1.7);
      tl.set("#ambient-bg", { y: 0, filter: "blur(0px)" }, 1.7);

      // 4) Negro -> revela siguiente sección (About) DESPUÉS del corte
      // Nota: About está en otra sección (#about) fuera del intro.
      tl.to("#fade-layer", { opacity: 0, duration: 0.45 }, 1.65);

      // (Opcional) reveal elegante del contenido del About
      // Esto ya es independiente del intro, y corre cuando About entra al viewport.
      gsap.fromTo(
        "#about",
        { opacity: 0, y: 40, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
            end: "top 55%",
            scrub: 1,
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
      <section id="intro" className="relative h-[300vh]">
        {/* ✅ Cortina negra (GTA)
            - Arranca en opacity 0 para no oscurecer el inicio
            - Luego la subimos a 1 para hacer el "corte" y después la bajamos para revelar el About */}
        <div
          id="fade-layer"
          className="fixed inset-0 z-999 bg-black pointer-events-none"
          style={{ opacity: 0 }}
        />

        {/* ✅ Ambient background (solo durante el mask) */}
        <div id="ambient-bg" className="fixed inset-0 z-0 opacity-0 pointer-events-none">
          <Image
            id="ambient-bg-img"
            src="/home-1-desktop.png"
            alt="Ambient background"
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* ✅ Capa enmascarada (intro) */}
        <div id="logo-mask" className="fixed inset-0 z-10 w-full h-screen">
          <section className="h-screen">
            {/* Contenedor que se comporta como el picture del video */}
            <div id="hero-key" className="fixed inset-0 h-screen scale-125 overflow-hidden">
              <picture className="relative block w-full h-full">
                {/* Fondo */}
                <Image
                  id="hero-key-background"
                  src="/home-2-desktop.png"
                  alt="Hero key background"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Logo centrado */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Image
                    id="hero-key-logo"
                    src="/logo.svg"
                    alt="Hero key logo"
                    width={260}
                    height={260}
                    className="object-contain"
                  />
                </div>
              </picture>
            </div>
          </section>
        </div>

        {/* ✅ Header SIEMPRE visible */}
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-between h-screen px-20 p-16 w-full pointer-events-none">
          <header className="flex justify-between w-full pointer-events-auto">
            <Image src="/logo.svg" alt="Logo" width={100} height={24} />
            <p>Menu</p>
          </header>
        </div>
      </section>

      {/* ✅ ABOUT: Sección 2 (ya es otra sección real del documento)
          Aquí YA NO existe el overlay del intro porque el timeline llegó al final */}
      <section id="about" className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">About</h2>
        <p className="mt-6 text-white/70 text-lg">
          Soy Alejandro — construyo productos con Next.js, Node, AWS y MySQL.
        </p>
      </section>

      {/* Luego puedes crear #stack y #projects como secciones 3 y 4 */}
      <section className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Stack</h2>
        <p className="mt-6 text-white/70 text-lg">
          Next.js — React — Tailwind — Node — AWS — MySQL — Prisma.
        </p>
      </section>

      <section className="relative z-10 min-h-screen px-20 py-24 bg-black">
        <h2 className="text-5xl font-semibold">Projects</h2>
        <p className="mt-6 text-white/70 text-lg">
          Spellbook — Embipos — Troubleshoot-Labs — Propel.
        </p>
      </section>
    </main>
  );
}

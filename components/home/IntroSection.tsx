"use client";

import Image from "next/image";
import styles from "./intro/IntroSection.module.css";
import { SimpleProfileCard } from "./intro/SimpleProfileCard";
import SocialLinks from "./intro/SocialLinks";
import HeaderMenu from "./intro/HeaderMenu";

type IntroSectionProps = {
  hero: typeof import("@/content/home/hero.json");
};

export default function IntroSection({ hero }: IntroSectionProps) {
  return (
    <section id="intro" className="relative h-[200vh] overflow-x-hidden">
      <div
        id="ambient-bg"
        className="fixed inset-0 z-0 opacity-0 pointer-events-none"
      />

      <div id="logo-mask" className="fixed inset-0 z-10 h-[100svh]">
        <section className="h-[100svh]">
          <div
            id="hero-key"
            className="fixed inset-0 h-[100svh] overflow-hidden"
          >
            <div className="relative block w-full h-full bg-[#0a0a0f] overflow-hidden">
              <div className={styles.backgroundContainer} aria-hidden="true">
                <div className={styles.gridPattern} />
                <div className={styles.centerGlow} />
                <div className={`${styles.particle} ${styles.particle1}`} />
                <div className={`${styles.particle} ${styles.particle2}`} />
                <div className={`${styles.particle} ${styles.particle3}`} />
                <div className={`${styles.particle} ${styles.particle4}`} />
                <div className={`${styles.particle} ${styles.particle5}`} />
              </div>

              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        </section>
      </div>

      <div
        id="hero-overlay"
        className="fixed inset-0 z-20 pointer-events-auto overflow-x-hidden"
      >
        <div
          className="
            mx-auto w-full max-w-6xl h-[100svh]
            px-4 sm:px-6 lg:px-12
            flex items-start lg:items-center
            pt-24 pb-10 lg:pt-0 lg:pb-0

            /* ✅ phones grandes (390–639): centra y ajusta padding */
            [@media(min-width:390px)_and_(max-width:639px)]:items-center
            [@media(min-width:390px)_and_(max-width:639px)]:pt-16
            [@media(min-width:390px)_and_(max-width:639px)]:pb-16
          "
        >
          <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className={styles.animateCard}>
              <div
                className="
                  mx-auto w-full max-w-[340px]
                  sm:max-w-md lg:max-w-none
                  origin-top scale-[0.92] sm:scale-100 lg:scale-100

                  /* ✅ phones grandes (390–639): más ancho y sin scale */
                  [@media(min-width:390px)_and_(max-width:639px)]:max-w-[380px]
                  [@media(min-width:390px)_and_(max-width:639px)]:scale-100
                "
              >
                <SimpleProfileCard
                  name={hero.profileCard?.name ?? "Alejandro Andrade"}
                  handle={hero.profileCard?.handle ?? "alejandroandrade"}
                  title={hero.profileCard?.title ?? "Software Developer"}
                  avatarSrc={hero.profileCard?.avatarUrl ?? "/avatar.jpg"}
                />

                <div className="mt-4 lg:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="mailto:contacto@ejemplo.com"
                      className="inline-flex items-center justify-center px-4 py-3 rounded-2xl font-semibold text-white
                                 bg-gradient-to-r from-blue-500 to-purple-600
                                 transition-transform duration-200 active:scale-[0.98]"
                    >
                      Contáctame
                    </a>

                    <a
                      href="/portfolio"
                      className="inline-flex items-center justify-center px-4 py-3 rounded-2xl font-semibold text-white
                                 border border-white/15 bg-white/5
                                 transition-transform duration-200 active:scale-[0.98]"
                    >
                      Ver Portfolio
                    </a>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <SocialLinks
                      github="https://github.com/usuario"
                      linkedin="https://linkedin.com/in/usuario"
                      twitter="https://twitter.com/usuario"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex min-w-0 flex-col gap-6 lg:gap-8">
              <div className={styles.animateText}>
                <p className="text-blue-400 font-medium mb-3 tracking-wide">
                  👋 Hola, soy
                </p>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95]">
                  Alejandro
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Andrade
                  </span>
                </h1>

                <p className="mt-5 text-base sm:text-xl text-slate-300/80 max-w-lg leading-relaxed">
                  Desarrollador de software. Construyo productos con foco en{" "}
                  <span className="text-white font-medium">performance</span>, UX
                  y detalle visual.
                </p>
              </div>

              <div className={`flex flex-wrap gap-3 sm:gap-4 ${styles.animateCta}`}>
                <a
                  href="mailto:contacto@ejemplo.com"
                  className="group relative inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <span className="relative z-10">Contáctame</span>
                </a>

                <a
                  href="/portfolio"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-white/20 text-white font-semibold rounded-xl transition-transform duration-300 hover:bg-white/5 hover:border-white/40 hover:scale-[1.03]"
                >
                  Ver Portfolio
                </a>
              </div>

              <div className={styles.animateSocial}>
                <SocialLinks
                  github="https://github.com/usuario"
                  linkedin="https://linkedin.com/in/usuario"
                  twitter="https://twitter.com/usuario"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      


     
    </section>
  );
}

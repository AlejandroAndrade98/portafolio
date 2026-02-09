"use client";

import Image from "next/image";
import HeaderMenu from "./intro/HeaderMenu";

type Props = {
  hero: typeof import("@/content/home/hero.json");
};

export default function HomeHeader({ hero }: Props) {
  return (
    <div
      id="site-header"
      className="fixed inset-x-0 top-0 z-[150] pointer-events-none isolate"
    >
      {/* 
        Mobile: columna centrada (92vw) -> se siente centrado
        Desktop: se expande y se va más a bordes
      */}
      <div
        className="
          pointer-events-auto mx-auto
          w-[min(520px,92vw)]
          sm:w-full sm:max-w-6xl
          lg:max-w-none

          pt-6 sm:pt-8 lg:pt-10
          sm:px-6 lg:px-10 2xl:px-14
        "
      >
        <header className="flex items-center justify-between w-full">
          <Image
            src={hero.header.logo.src}
            alt={hero.header.logo.alt}
            width={hero.header.logo.width}
            height={hero.header.logo.height}
            className="w-40 sm:w-48 h-auto"
            style={{ height: "auto" }}
            priority
          />

          {/* evita que el botón “encoga” raro */}
          <div className="shrink-0">
            <HeaderMenu
              mailto="mailto:contacto@ejemplo.com"
              github="https://github.com/usuario"
              linkedin="https://linkedin.com/in/usuario"
              twitter="https://twitter.com/usuario"
            />
          </div>
        </header>
      </div>
    </div>
  );
}

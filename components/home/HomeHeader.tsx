"use client";

import Image from "next/image";
import HeaderMenu from "./intro/HeaderMenu";

type MenuData = typeof import("@/content/en/home/menu.json");

type Props = {
  hero: typeof import("@/content/en/home/hero.json");
  locale: "en" | "es";
  menu: MenuData;
};

export default function HomeHeader({ hero, locale, menu }: Props) {
  const mail = hero.profileCard?.mail ?? "alejandro21112@hotmail.com";
  const phone = hero.profileCard?.phone ?? "+573203119505";
  const wa = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div id="site-header" className="fixed inset-x-0 top-0 z-[150] pointer-events-none isolate">
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

          <div className="shrink-0">
            <HeaderMenu
              locale={locale}
              labels={menu}
              mailto={`mailto:${mail}`}
              github="https://github.com/AlejandroAndrade98"
              linkedin="https://www.linkedin.com/in/alejandroandrade-tech"
              whatsapp={wa}
            />
          </div>
        </header>
      </div>
    </div>
  );
}
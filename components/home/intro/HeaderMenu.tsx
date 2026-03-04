"use client";

import { useEffect, useId, useRef, useState } from "react";
import SocialLinks from "./SocialLinks";
import LocaleToggle from "@/components/i18n/LocaleToggle";

type MenuLabels = typeof import("@/content/en/home/menu.json");

type Props = {
  locale: "en" | "es";
  labels: MenuLabels;
  mailto?: string;
  github?: string;
  linkedin?: string;
  whatsapp?: string;
};

type SectionKey = "intro" | "about" | "projects" | "stack";

export default function HeaderMenu({
  locale,
  labels,
  mailto = "mailto:alejandro21112@hotmail.com",
  github = "https://github.com/AlejandroAndrade98",
  linkedin = "https://www.linkedin.com/in/alejandroandrade-tech",
  whatsapp = "https://wa.me/573203119505",
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SectionKey>("intro");

  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const mountedRef = useRef(false);

  const sectionsRef = useRef<{ key: SectionKey; el: HTMLElement }[]>([]);
  const topsRef = useRef<{ key: SectionKey; top: number }[]>([]);
  const rafRef = useRef<number | null>(null);

  const getScrollY = () => window.scrollY ?? document.documentElement.scrollTop ?? 0;
  const closeMenu = () => setOpen(false);

  const setActiveSafe = (key: SectionKey) => {
    setActive((prev) => (prev === key ? prev : key));
  };

  const recomputeTops = () => {
    const y = getScrollY();
    topsRef.current = sectionsRef.current
      .map(({ key, el }) => ({ key, top: el.getBoundingClientRect().top + y }))
      .sort((a, b) => a.top - b.top);
  };

  const updateActiveFromScroll = () => {
    const y = getScrollY();
    const spyY = y + window.innerHeight * 0.35;

    const tops = topsRef.current;
    if (!tops.length) return;

    let current: SectionKey = tops[0].key;
    for (const s of tops) {
      if (s.top <= spyY) current = s.key;
      else break;
    }
    setActiveSafe(current);
  };

  const scheduleUpdate = () => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateActiveFromScroll();
    });
  };

  const getHeaderOffset = () => {
    const hdr = document.getElementById("site-header");
    if (!hdr) return 96;
    const rect = hdr.getBoundingClientRect();
    return rect.height + 12;
  };

  const skipFocusRestoreRef = useRef(false);

  const scrollTo = (key: SectionKey, selector: string) => {
    setActiveSafe(key);
    skipFocusRestoreRef.current = true;
    closeMenu();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (!el) {
          skipFocusRestoreRef.current = false;
          return;
        }

        const y = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

        window.setTimeout(() => {
          skipFocusRestoreRef.current = false;
        }, 500);
      });
    });
  };

  // ESC + lock scroll + devolver foco al botón al cerrar
  useEffect(() => {
    if (open) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMenu();
      };
      window.addEventListener("keydown", onKeyDown);

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    } else {
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }
      if (!skipFocusRestoreRef.current) {
        buttonRef.current?.focus();
      }
    }
  }, [open]);

  // Scroll spy
  useEffect(() => {
    const ids: { key: SectionKey; sel: string }[] = [
      { key: "intro", sel: "#intro" },
      { key: "about", sel: "#about" },
      { key: "projects", sel: "#projects" },
      { key: "stack", sel: "#stack" },
    ];

    sectionsRef.current = ids
      .map((x) => ({ key: x.key, el: document.querySelector(x.sel) as HTMLElement | null }))
      .filter((x): x is { key: SectionKey; el: HTMLElement } => !!x.el);

    if (!sectionsRef.current.length) return;

    recomputeTops();
    updateActiveFromScroll();

    const onResize = () => {
      recomputeTops();
      scheduleUpdate();
    };

    const onScroll = () => scheduleUpdate();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const timeout = window.setTimeout(() => {
      recomputeTops();
      updateActiveFromScroll();
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInicioDisabled = active === "intro";

  const navItemBase =
    "w-full rounded-xl sm:rounded-2xl px-4 py-2.5 sm:py-3 text-left text-white/90 " +
    "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 transition";

  const navItemActive =
    "bg-white/10 border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]";

  const navItemDisabled =
    "opacity-40 cursor-not-allowed hover:bg-white/5 hover:border-white/10";

  return (
    <>
      {/* Botón hamburger */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={labels.title}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className="pointer-events-auto inline-flex items-center justify-center rounded-2xl p-3
                   border border-white/10 bg-white/5 backdrop-blur
                   hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
      >
        <span className="sr-only">{labels.title}</span>
        <span className="flex flex-col gap-1.5">
          <span className="h-[2px] w-6 rounded-full bg-white/85" />
          <span className="h-[2px] w-5 rounded-full bg-white/65" />
        </span>
      </button>

      {/* Overlay + Panel */}
      <div
        className={[
          "fixed inset-0 z-[60] transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        {/* Overlay visual (sin click handler) */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] pointer-events-none" />

        {/* ✅ click afuera cierra */}
        <div
          className="relative h-full w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center sm:items-start sm:justify-end"
          onPointerDown={closeMenu}
        >
          {/* ✅ click dentro NO cierra */}
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            onPointerDown={(e) => e.stopPropagation()}
            className={[
              "w-[min(92vw,420px)] sm:w-[min(420px,36vw)]",
              "max-h-[92svh] overflow-hidden",
              "rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl",
              "shadow-2xl shadow-black/40",
              "transform transition-transform duration-200",
              open
                ? "translate-y-0 translate-x-0 scale-100"
                : "translate-y-6 sm:translate-y-0 sm:translate-x-3 scale-[0.98]",
            ].join(" ")}
          >
            {/* ✅ scrollbar oculto pero scroll permitido */}
            <div className="max-h-[92svh] overflow-y-auto no-scrollbar">
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white font-semibold tracking-tight">{labels.title}</p>

                  <button
                    type="button"
                    aria-label={locale === "es" ? "Cerrar" : "Close"}
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center rounded-xl p-2
                               hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <span className="relative block h-5 w-5">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/80 rounded-full" />
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white/80 rounded-full" />
                    </span>
                  </button>
                </div>

                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Navegación */}
                <div className="mt-4 sm:mt-5">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    {labels.sections.nav}
                  </p>

                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => !isInicioDisabled && scrollTo("intro", "#intro")}
                      aria-disabled={isInicioDisabled}
                      disabled={isInicioDisabled}
                      className={[
                        navItemBase,
                        active === "intro" ? navItemActive : "",
                        isInicioDisabled ? navItemDisabled : "",
                      ].join(" ")}
                    >
                      {labels.items.intro}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollTo("about", "#about")}
                      className={[navItemBase, active === "about" ? navItemActive : ""].join(" ")}
                    >
                      {labels.items.about}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollTo("projects", "#projects")}
                      className={[navItemBase, active === "projects" ? navItemActive : ""].join(" ")}
                    >
                      {labels.items.projects}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollTo("stack", "#stack")}
                      className={[navItemBase, active === "stack" ? navItemActive : ""].join(" ")}
                    >
                      {labels.items.stack}
                    </button>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 sm:mt-5">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    {labels.sections.actions}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={mailto}
                      onClick={closeMenu}
                      className="inline-flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-2xl font-semibold text-white
                                 bg-gradient-to-r from-blue-500 to-purple-800
                                 transition-transform duration-200 active:scale-[0.98]"
                    >
                      {labels.actions.contact}
                    </a>

                    <button
                      type="button"
                      onClick={() => scrollTo("projects", "#projects")}
                      className="inline-flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-2xl font-semibold text-white
                                 border border-white/15 bg-white/5
                                 transition-transform duration-200 active:scale-[0.98]"
                    >
                      {labels.actions.viewProjects}
                    </button>

                    {/* Toggle centrado */}
                    <div className="col-span-2 flex justify-center pt-0.5">
                      <LocaleToggle locale={locale} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Redes */}
                <div className="mt-4 sm:mt-5">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 text-center">
                    {labels.sections.social}
                  </p>
                  <div className="flex justify-center">
                    <SocialLinks github={github} linkedin={linkedin} whatsapp={whatsapp} />
                  </div>
                </div>
              </div>

              <div className="h-[max(6px,env(safe-area-inset-bottom))]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
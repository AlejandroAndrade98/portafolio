"use client";

import { usePathname, useRouter } from "next/navigation";

type Locale = "en" | "es";

function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function LocaleToggle({
  locale,
  className = "",
  size = "sm",
}: {
  locale: Locale;
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const h = size === "sm" ? "h-10" : "h-11";
  const w = size === "sm" ? "w-[96px]" : "w-[110px]";
  const pad = size === "sm" ? "p-1" : "p-1.5";
  const text = size === "sm" ? "text-xs" : "text-sm";

  const go = (next: Locale) => {
    const parts = pathname.split("/").filter(Boolean);
    const nextParts = parts.length ? [...parts] : [next];
    nextParts[0] = next;

    const nextPath = `/${nextParts.join("/")}`;
    setLocaleCookie(next);
    router.push(nextPath);
  };

  const nextLocale: Locale = locale === "en" ? "es" : "en";

  return (
    <button
      type="button"
      onClick={() => go(nextLocale)}
      className={[
        "relative inline-flex items-center select-none",
        h,
        w,
        pad,
        "rounded-full border border-white/15 bg-white/5 backdrop-blur",
        "hover:bg-white/10 transition",
        className,
      ].join(" ")}
      aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
      title="Switch language"
    >
      {/* Thumb */}
      <span
        className={[
          "absolute top-1 bottom-1 left-1",
          "w-[calc(50%-0.25rem)]",
          "rounded-full bg-sky-400/25",
          "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
          "transition-transform duration-300 ease-out",
          locale === "es" ? "translate-x-full" : "translate-x-0",
        ].join(" ")}
        aria-hidden
      />

      {/* Labels */}
      <span className={["relative z-10 flex-1 text-center font-semibold", text, locale === "en" ? "text-white" : "text-white/60"].join(" ")}>
        EN
      </span>
      <span className={["relative z-10 flex-1 text-center font-semibold", text, locale === "es" ? "text-white" : "text-white/60"].join(" ")}>
        ES
      </span>
    </button>
  );
}
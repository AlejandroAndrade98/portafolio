"use client";

import * as React from "react";
import type { ElementType, ComponentPropsWithoutRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AsTag = ElementType;

type ScrollRevealProps<T extends AsTag = "div"> = {
  as?: T;
  children: React.ReactNode;

  scrollContainerRef?: React.RefObject<HTMLElement>;
  enableBlur?: boolean;

  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;

  rotationEnd?: string;
  wordAnimationEnd?: string;

  y?: number;

  className?: string;
  textClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "children" | "className">;

function getTextIfPureString(node: React.ReactNode): string | null {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);

  if (Array.isArray(node)) {
    const parts: string[] = [];
    for (const n of node) {
      if (typeof n === "string" || typeof n === "number") parts.push(String(n));
      else return null;
    }
    return parts.join("");
  }

  return null;
}

export default function ScrollReveal<T extends AsTag = "div">({
  as,
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 3,
  blurStrength = 10,
  rotationEnd = "+=320",          // ← CAMBIO
  wordAnimationEnd = "+=320",     // ← CAMBIO
  y = 0,
  className = "",
  textClassName = "",
  ...rest
}: ScrollRevealProps<T>) {
  const Tag = (as ?? "div") as any;
  const containerRef = React.useRef<HTMLElement | null>(null);

  const text = React.useMemo(() => getTextIfPureString(children), [children]);
  const isWordMode = typeof text === "string";

  const splitText = React.useMemo(() => {
    if (!isWordMode) return null;

    return text!.split(/(\s+)/).map((chunk, index) => {
      if (/^\s+$/.test(chunk)) return chunk;
      return (
        <span className="word" key={index}>
          {chunk}
        </span>
      );
    });
  }, [isWordMode, text]);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ?? undefined;

    const ctx = gsap.context(() => {
      // 🔹 Rotación / entrada del contenedor
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation, y },
        {
          rotate: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top 92%",          // ← CAMBIO
            end: rotationEnd,
            scrub: 1.2,               // ← CAMBIO
            fastScrollEnd: true,       // ← CAMBIO
          },
        }
      );

      if (isWordMode) {
        const words = el.querySelectorAll<HTMLElement>(".word");

        // 🔹 Opacidad por palabra
        gsap.fromTo(
          words,
          { opacity: baseOpacity, willChange: "opacity, filter, transform" }, // ← CAMBIO
          {
            opacity: 1,
            ease: "none",
            stagger: 0.03,             // ← CAMBIO
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top 92%",        // ← CAMBIO
              end: wordAnimationEnd,
              scrub: 1.2,              // ← CAMBIO
              fastScrollEnd: true,     // ← CAMBIO
            },
          }
        );

        // 🔹 Blur por palabra
        if (enableBlur) {
          gsap.fromTo(
            words,
            { filter: `blur(${blurStrength}px)` },
            {
              filter: "blur(0px)",
              ease: "none",
              stagger: 0.03,           // ← CAMBIO
              scrollTrigger: {
                trigger: el,
                scroller,
                start: "top 92%",      // ← CAMBIO
                end: wordAnimationEnd,
                scrub: 1.2,            // ← CAMBIO
                fastScrollEnd: true,   // ← CAMBIO
              },
            }
          );
        }
      } else {
        // 🔹 Fallback: bloque completo
        gsap.fromTo(
          el,
          { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top 92%",        // ← CAMBIO
              end: wordAnimationEnd,
              scrub: 1.2,              // ← CAMBIO
              fastScrollEnd: true,     // ← CAMBIO
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseOpacity,
    baseRotation,
    blurStrength,
    rotationEnd,
    wordAnimationEnd,
    y,
    isWordMode,
  ]);

  return (
    <Tag
      ref={(node: any) => (containerRef.current = node)}
      className={`scroll-reveal ${className}`}
      {...rest}
    >
      {isWordMode ? (
        <span className={`scroll-reveal-text ${textClassName}`}>{splitText}</span>
      ) : (
        children
      )}
    </Tag>
  );
}

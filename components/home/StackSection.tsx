"use client";

import { useState } from "react";
import { Server, ShieldCheck, Database, ArrowRight, RotateCcw } from "lucide-react";
import styles from "./StackSection.module.css";

type StackData = typeof import("@/content/en/home/stack.json");

type StackSectionProps = {
  data: StackData;
};

const ICONS = {
  server: Server,
  shield: ShieldCheck,
  database: Database,
} as const;

export default function StackSection({ data }: StackSectionProps) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="stack" className="relative py-24 px-6 lg:px-12 overflow-hidden">
      <div className={styles.bgBlend} aria-hidden="true" />
      <div className={styles.sectionGlow} aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 ${styles.animateHeader}`}>
          {/* {data.tag && (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
              {data.tag}
            </span>
          )} */}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r text-white bg-clip-text text-transparent">
            {data.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {data.cards.map((card, index) => {
            const Icon = ICONS[card.icon as keyof typeof ICONS] ?? Server;

            // Mantengo tus animaciones existentes por index (sin hardcode de contenido)
            const anim =
              index === 0 ? styles.animateCard1 : index === 1 ? styles.animateCard2 : styles.animateCard3;

            return (
              <button
                key={card.key}
                type="button"
                className={`${styles.cardContainer} ${anim}`}
                onClick={() => toggleFlip(index)}
                aria-pressed={!!flipped[index]}
                aria-label={`${data.ui?.ariaOpenDetails ?? "Open details"}: ${card.title}`}
              >
                <div className={`${styles.cardInner} ${flipped[index] ? styles.flipped : ""}`}>
                  {/* Front */}
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <div
                      className={`${styles.iconWrapper} w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-5`}
                    >
                      <Icon className="w-7 h-7 text-cyan-400" />
                    </div>

                    <h3 className="text-white font-bold text-xl mb-3">{card.title}</h3>

                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{card.text}</p>

                    <div className={`${styles.clickHint} flex items-center gap-1.5 mt-4 text-cyan-400 text-xs font-medium`}>
                      <span>{data.ui?.seeDetails ?? "See details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Back */}
                  <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-cyan-400 font-bold text-lg">{card.title}</h3>
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                    </div>

                    <ul className="space-y-3 flex-1">
                      {card.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2.5 text-slate-300 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 text-slate-500 text-xs text-center">
                      {data.ui?.clickToReturn ?? "Click to return"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Callout */}
        <div className={`${styles.calloutBar} ${styles.animateCallout} rounded-xl p-6 mb-8`}>
          <h3 className="text-white font-semibold text-lg mb-4">{data.callout.title}</h3>
          <ul className="space-y-2.5">
            {data.callout.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-slate-400 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Proof */}
        {data.proofText && (
          <p className={`${styles.animateProof} ${styles.proofText} text-center text-sm font-medium`}>
            {data.proofText}
          </p>
        )}
      </div>
    </section>
  );
}
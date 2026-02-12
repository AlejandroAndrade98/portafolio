"use client";

import { useState } from "react";
import { Server, ShieldCheck, Database, ArrowRight, RotateCcw } from "lucide-react";
import styles from "./StackSection.module.css";

type StackSectionProps = {
  title: string;
  subtitle: string;
  tag?: string; // opcional: pill arriba
  proofText?: string; // opcional: texto final
};

const cards = [
  {
    icon: Server,
    title: "APIs (Node + Express)",
    text: "Rutas, controladores y middlewares para flujos claros y mantenibles.",
    anim: styles.animateCard1,
    details: [
      "Arquitectura RESTful con separación clara de responsabilidades",
      "Middlewares reutilizables para auth, logging y validación",
      "Manejo de errores centralizado con respuestas consistentes",
      "Versionado de API y documentación integrada",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Auth & Roles",
    text: "JWT, refresh tokens y RBAC para acceso seguro y granular.",
    anim: styles.animateCard2,
    details: [
      "Flujo completo: login, registro, refresh y logout",
      "Tokens con expiración y rotación automática",
      "Control de acceso por roles y permisos específicos",
      "Buenas prácticas contra ataques comunes (CSRF, XSS)",
    ],
  },
  {
    icon: Database,
    title: "Data Layer",
    text: "MySQL/Postgres + Prisma, relaciones claras y migraciones controladas.",
    anim: styles.animateCard3,
    details: [
      "Schemas tipados con Prisma para consistencia total",
      "Migraciones versionadas y reproducibles",
      "Relaciones 1:N y N:M con tablas intermedias",
      "Seeds/fixtures para desarrollo y testing",
    ],
  },
] as const;

const bullets = [
  "Logging y trazabilidad básica",
  "Validación de inputs en cada endpoint",
  "Manejo de errores consistente y predecible",
  "Separación por capas: routes / services / db",
] as const;

export default function StackSection({
  title,
  subtitle,
  tag,
  proofText = "Aplicado en proyectos reales como Embipos POS API (Express + Prisma + MySQL).",
}: StackSectionProps) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="stack" className="relative py-24 px-6 lg:px-12 overflow-hidden">
      {/* ✅ NEW: capa que mezcla el fondo anterior con el de Stack */}
      <div className={styles.bgBlend} aria-hidden="true" />

      <div className={styles.sectionGlow} aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 ${styles.animateHeader}`}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            {tag}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r text-white bg-clip-text text-transparent">
            {title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                type="button"
                className={`${styles.cardContainer} ${card.anim}`}
                onClick={() => toggleFlip(index)}
                aria-pressed={!!flipped[index]}
                aria-label={`Abrir detalles: ${card.title}`}
              >
                <div className={`${styles.cardInner} ${flipped[index] ? styles.flipped : ""}`}>
                  {/* Front */}
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <div className={`${styles.iconWrapper} w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-5`}>
                      <Icon className="w-7 h-7 text-cyan-400" />
                    </div>

                    <h3 className="text-white font-bold text-xl mb-3">{card.title}</h3>

                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{card.text}</p>

                    <div className={`${styles.clickHint} flex items-center gap-1.5 mt-4 text-cyan-400 text-xs font-medium`}>
                      <span>Ver detalles</span>
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

                    <div className="mt-3 text-slate-500 text-xs text-center">Click para volver</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Callout */}
        <div className={`${styles.calloutBar} ${styles.animateCallout} rounded-xl p-6 mb-8`}>
          <h3 className="text-white font-semibold text-lg mb-4">Diagnóstico primero, cambios con intención</h3>
          <ul className="space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-slate-400 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Proof */}
        <p className={`${styles.animateProof} ${styles.proofText} text-center text-sm font-medium`}>
          {proofText}
        </p>
      </div>
    </section>
  );
}

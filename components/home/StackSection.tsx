"use client";

export default function StackSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section id="stack" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
      <div id="stack-content">
        {/* tu contenido */}
        <h2 className="text-5xl">{title}</h2>
        <p className="text-white/70 mt-3">{subtitle}</p>
      </div>
    </section>
  );
}

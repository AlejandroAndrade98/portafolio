import Image from "next/image";
import styles from "./IntroSection.module.css";

const technologies = [
  { name: "React", icon: "⚛️" },
  { name: "TypeScript", icon: "🔷" },
  { name: "Node.js", icon: "🟢" },
  { name: "Next.js", icon: "▲" },
  { name: "Tailwind", icon: "🎨" },
  { name: "PostgreSQL", icon: "🐘" },
];

type Props = {
  name: string;
  handle: string;
  title: string;
  avatarSrc: string;
  status?: string;
};

export function SimpleProfileCard({ name, handle, title, avatarSrc, status = "Online" }: Props) {
  return (
    <div className="relative">
      <div className={styles.glowBorder} />

      <div className={`${styles.techCard} p-6 sm:p-8`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-slate-900 overflow-hidden">
                <Image
                  src={avatarSrc}
                  alt={name}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-slate-900" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{name}</h3>
            <p className="text-slate-400 text-sm truncate">@{handle}</p>
            <p className="text-slate-400 text-sm">{title}</p>

            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {status}
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-8" />

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
            Tech Stack
          </p>

          <div className="grid grid-cols-3 gap-3">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className={`${styles.techIcon} flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5 cursor-default`}
              >
                <span className="text-2xl">{tech.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">5+</p>
            <p className="text-xs text-slate-500">Años exp.</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">50+</p>
            <p className="text-xs text-slate-500">Proyectos</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-xs text-slate-500">Pasión</p>
          </div>
        </div>
      </div>
    </div>
  );
}

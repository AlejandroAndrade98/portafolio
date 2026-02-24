import styles from "./IntroOverlay.module.css";
import { SimpleProfileCard } from "./SimpleProfileCard";
import SocialLinks from "./SocialLinks";

type Props = {
  hero: typeof import("@/content/home/hero.json");
};

export default function IntroOverlay({ hero }: Props) {
  const fullName = hero?.profileCard?.name ?? "Alejandro Anibal Andrade";
  const title = hero?.profileCard?.title ?? "Software Developer";
  const handle = hero?.profileCard?.handle ?? "alejandroandrade";

  // ✅ OJO: aquí es "mail" porque así está en tu hero.json
  const mail = hero?.profileCard?.mail ?? "alejandro21112@hotmail.com";
  const phone = hero?.profileCard?.phone ?? "+573203119505";

  const portfolioHref = "/portfolio";

  // Opcional: WhatsApp link limpio desde el phone
  const waHref = `https://wa.me/${phone.replace(/\D/g, "")}`;

  const firstName = fullName.split(" ")[0] || "Alejandro";
  const lastName = fullName.split(" ").slice(1).join(" ") || "Andrade";

  return (
    <div className="h-full flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Izquierda: card */}
        <div className={styles.animateCard}>
          <SimpleProfileCard
          name={fullName}
          handle={handle}
          title={title}
          avatarSrc={hero?.profileCard?.avatarUrl ?? "/avatar.jpg"}
          mail={hero?.profileCard?.mail}
          phone={hero?.profileCard?.phone}
          showUserInfo={hero?.profileCard?.showUserInfo}
          />
        </div>

        {/* Derecha: texto */}
        <div className="flex flex-col gap-8">
          <div className={styles.animateText}>
            <p className="text-sky-300 font-medium mb-3 tracking-wide">
              Hola, soy
            </p>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              {firstName}
              <span className="block bg-gradient-to-r from-sky-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                {lastName}
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-300/80 max-w-lg leading-relaxed">
              {title}. Construyo productos con foco en{" "}
              <span className="text-white font-medium">
                performance, UX y detalle visual
              </span>
              .
            </p>

            {/* ✅ 2 “accesos rápidos” con emojis */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <a
                href={`mailto:${mail}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10 transition"
              >
                📧 <span className="underline underline-offset-2">{mail}</span>
              </a>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10 transition"
              >
                💬 <span className="underline underline-offset-2">{phone}</span>
              </a>
            </div>
          </div>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-4 ${styles.animateCta}`}>
            <a
              href={`mailto:${mail}`}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-sky-500 to-purple-800 text-white font-semibold rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
            >
              <span className="relative z-10">Contáctame</span>
            </a>

            <a
              href={portfolioHref}
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-semibold rounded-xl transition-transform duration-200 hover:scale-[1.03] hover:bg-white/5 hover:border-white/40"
            >
              Ver Portfolio
            </a>
          </div>

          {/* Redes */}
          <div className={styles.animateSocial}>
            <SocialLinks
              github="https://github.com/AlejandroAndrade98"
              linkedin="https://www.linkedin.com/in/alejandroandrade-tech"
              whatsapp={waHref}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

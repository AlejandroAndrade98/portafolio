import { Github, Linkedin, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SocialLinksProps = {
  github: string;
  linkedin: string;
  whatsapp: string;
};

type SocialLink = {
  name: string;
  href: string;
  Icon: LucideIcon;
};

export default function SocialLinks({ github, linkedin, whatsapp }: SocialLinksProps) {
  const socialLinks: SocialLink[] = [
    { name: "GitHub", href: github, Icon: Github },
    { name: "LinkedIn", href: linkedin, Icon: Linkedin },
    { name: "WhatsApp", href: whatsapp, Icon: MessageCircle },
  ];

  return (
    <div className="flex gap-4">
      {socialLinks.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="p-2 text-slate-400 transition-all duration-200 hover:scale-110 hover:text-white"
        >
          <Icon className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}

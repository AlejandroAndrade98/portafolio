import { Github, Linkedin, Twitter } from "lucide-react";

type SocialLinksProps = {
  github: string;
  linkedin: string;
  twitter: string;
};

export default function SocialLinks({ github, linkedin, twitter }: SocialLinksProps) {
  const socialLinks = [
    { name: "GitHub", href: github, icon: Github },
    { name: "LinkedIn", href: linkedin, icon: Linkedin },
    { name: "Twitter", href: twitter, icon: Twitter },
  ];

  return (
    <div className="flex gap-4">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="p-2 text-slate-400 transition-all duration-200 hover:scale-110 hover:text-white"
        >
          <link.icon className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}

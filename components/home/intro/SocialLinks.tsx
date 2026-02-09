import { Github, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/AlejandroAndrade98", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin }, // cámbialo
  { name: "Twitter", href: "https://twitter.com", icon: Twitter }, // cámbialo
];

export function SocialLinks() {
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

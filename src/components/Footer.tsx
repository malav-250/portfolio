"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { personalInfo } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold tracking-tight">
            MG<span className="text-accent">.</span>
          </span>
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} Malav Gajera. Built with Next.js,
            Tailwind CSS &amp; Framer Motion.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { href: personalInfo.github, icon: <Github size={16} />, label: "GitHub" },
            { href: personalInfo.linkedin, icon: <Linkedin size={16} />, label: "LinkedIn" },
            { href: `mailto:${personalInfo.email}`, icon: <Mail size={16} />, label: "Email" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/5 transition-all duration-300"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

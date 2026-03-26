"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { personalInfo } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-text-muted text-xs">
          &copy; {new Date().getFullYear()} Malav Gajera. Built with Next.js &amp; Tailwind CSS.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, FileText } from "lucide-react";
import { heroContent, personalInfo } from "@/data/portfolio";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className="max-w-4xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light bg-surface-light/50 text-text-secondary text-xs mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Currently building at Crewasis
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            {heroContent.headline}
            <br />
            <span className="gradient-text">{heroContent.headlineAccent}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed"
          >
            {heroContent.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <a
              href="#projects"
              className="px-6 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-all duration-300 text-sm"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border border-border-light text-text-primary rounded-lg hover:bg-surface-light transition-all duration-300 text-sm"
            >
              Get in Touch
            </a>
            <div className="flex items-center gap-3 ml-2">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border hover:border-border-light hover:bg-surface-light transition-all duration-300 text-text-secondary hover:text-text-primary"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border hover:border-border-light hover:bg-surface-light transition-all duration-300 text-text-secondary hover:text-text-primary"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className="p-2.5 rounded-lg border border-border hover:border-border-light hover:bg-surface-light transition-all duration-300 text-text-secondary hover:text-text-primary"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
              <a
                href={personalInfo.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border hover:border-border-light hover:bg-surface-light transition-all duration-300 text-text-secondary hover:text-text-primary"
                aria-label="Resume"
              >
                <FileText size={18} />
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {heroContent.stats.map((stat, i) => (
              <div key={i} className="group">
                <div className="text-2xl sm:text-3xl font-bold text-text-primary group-hover:text-accent transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown size={16} className="text-text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

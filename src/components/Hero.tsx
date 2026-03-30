"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, FileText } from "lucide-react";
import { heroContent, personalInfo } from "@/data/portfolio";
import ParticleField from "./ParticleField";
import GridSpotlight from "./GridSpotlight";

function AnimatedWord({
  word,
  delay,
  className = "",
}: {
  word: string;
  delay: number;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className={`inline-block ${className}`}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {word}
      </motion.span>
    </span>
  );
}

function StatCounter({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div className="text-3xl sm:text-4xl font-bold text-text-primary group-hover:text-accent transition-colors duration-300">
        {value}
      </div>
      <div className="text-xs text-text-muted mt-1 tracking-wide">
        {label}
      </div>
      <div className="absolute -bottom-2 left-0 w-0 h-px bg-accent/50 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headlineWords = heroContent.headline.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Layered backgrounds */}
      <ParticleField />
      <GridSpotlight />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent-secondary/[0.04] rounded-full blur-[100px] animate-float-delayed" />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-6 py-32"
      >
        <div className="max-w-4xl">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-light bg-surface-light/50 text-text-secondary text-xs mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Building at Crewasis — Open to backend/cloud roles Aug 2026
          </motion.div>

          {/* Headline with word-by-word reveal */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-3">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <AnimatedWord word={word} delay={0.2 + i * 0.08} />
                {i < headlineWords.length - 1 && " "}
              </span>
            ))}
            <br />
            <AnimatedWord
              word={heroContent.headlineAccent}
              delay={0.2 + headlineWords.length * 0.08}
              className="gradient-text"
            />
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed"
          >
            {heroContent.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-wrap items-center gap-4 mb-20"
          >
            <a
              href="#projects"
              className="group relative px-7 py-3.5 bg-accent text-background font-semibold rounded-xl overflow-hidden text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              <span className="relative z-10">View Projects</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            <a
              href="#contact"
              className="px-7 py-3.5 border border-border-light text-text-primary rounded-xl hover:bg-surface-light/80 hover:border-accent/30 transition-all duration-300 text-sm font-medium"
            >
              Get in Touch
            </a>
            <div className="flex items-center gap-2 ml-2">
              {[
                {
                  href: personalInfo.github,
                  icon: <Github size={18} />,
                  label: "GitHub",
                },
                {
                  href: personalInfo.linkedin,
                  icon: <Linkedin size={18} />,
                  label: "LinkedIn",
                },
                {
                  href: `mailto:${personalInfo.email}`,
                  icon: <Mail size={18} />,
                  label: "Email",
                },
                {
                  href: personalInfo.resumeUrl,
                  icon: <FileText size={18} />,
                  label: "Resume",
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 text-text-secondary hover:text-accent transition-all duration-300"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {heroContent.stats.map((stat, i) => (
              <StatCounter
                key={i}
                value={stat.value}
                label={stat.label}
                delay={0.9 + i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-text-muted tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={14} className="text-text-muted" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

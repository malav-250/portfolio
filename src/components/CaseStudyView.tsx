"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Github,
  BookOpen,
  Trophy,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";
import type { Project, ProjectScreenshot } from "@/data/portfolio";
import MermaidDiagram from "./MermaidDiagram";

const badgeStyles: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  Research: {
    bg: "bg-violet-500/10 border-violet-500/20",
    text: "text-violet-400",
    icon: <BookOpen size={12} />,
  },
  "Hackathon Winner": {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    icon: <Trophy size={12} />,
  },
};

export default function CaseStudyView({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const [lightbox, setLightbox] = useState<ProjectScreenshot | null>(null);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      {/* ── Sticky back nav ────────────────────────────────────── */}
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} />
            All projects
          </Link>
          <div className="flex items-center gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:border-accent/40 hover:text-accent transition-all"
              >
                <Github size={14} />
                Code
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent text-background font-medium hover:bg-accent/90 transition-all"
              >
                <ExternalLink size={14} />
                Live
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {project.badge && badgeStyles[project.badge] && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${badgeStyles[project.badge].bg} ${badgeStyles[project.badge].text}`}
                >
                  {badgeStyles[project.badge].icon}
                  {project.badge}
                </span>
              )}
              {project.featured && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
                  <Sparkles size={12} />
                  Featured Project
                </span>
              )}
              {cs?.readingTime && (
                <span className="text-xs text-text-muted">
                  {cs.readingTime}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
              {project.title}
            </h1>
            <p className="text-lg sm:text-xl text-accent/90 font-medium mb-6">
              {project.subtitle}
            </p>
            <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
              {project.description}
            </p>

            {/* Tech stack chips */}
            <div className="flex flex-wrap gap-2 mt-8">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface-light border border-border text-text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────────── */}
      <article className="px-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Problem */}
          <Section eyebrow="01 — Problem" title="What was hard about this">
            <p className="text-text-secondary leading-relaxed">
              {cs?.problemDeep ?? project.problem}
            </p>
          </Section>

          {/* Architecture */}
          {cs?.architecture && (
            <Section eyebrow="02 — Architecture" title="How the pieces fit">
              <MermaidDiagram
                code={cs.architecture.diagram}
                caption={cs.architecture.caption}
              />
            </Section>
          )}

          {/* Solution (for projects without full case study) */}
          {!cs?.architecture && (
            <Section eyebrow="02 — Solution" title="How it works">
              <p className="text-text-secondary leading-relaxed">
                {project.solution}
              </p>
            </Section>
          )}

          {/* Decisions */}
          {cs?.decisions && cs.decisions.length > 0 && (
            <Section
              eyebrow="03 — Decisions"
              title="Trade-offs I'd defend in an interview"
            >
              <div className="space-y-6 mt-2">
                {cs.decisions.map((d, i) => (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-6 border-l-2 border-accent/40"
                  >
                    <h4 className="font-semibold text-base mb-2 flex items-start gap-2">
                      <span className="text-accent/80 font-mono text-xs mt-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {d.title}
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {d.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Outcomes */}
          <Section
            eyebrow={cs ? "04 — Outcomes" : "03 — Impact"}
            title="What shipped"
          >
            <ul className="space-y-3 mt-2">
              {(cs?.outcomes ?? project.impact).map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-text-secondary leading-relaxed"
                >
                  <ChevronRight
                    size={18}
                    className="text-accent shrink-0 mt-1"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Next steps */}
          {cs?.nextSteps && cs.nextSteps.length > 0 && (
            <Section
              eyebrow="05 — Next"
              title="What I'd do if this had another sprint"
            >
              <ul className="space-y-3 mt-2">
                {cs.nextSteps.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-text-secondary leading-relaxed"
                  >
                    <ChevronRight
                      size={18}
                      className="text-text-muted shrink-0 mt-1"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Screenshots / visual proof */}
          {cs?.screenshots && cs.screenshots.length > 0 && (
            <Section eyebrow="06 — Visual proof" title="See it in code">
              <div className="grid sm:grid-cols-2 gap-5 mt-2">
                {cs.screenshots.map((shot, i) => (
                  <motion.button
                    key={shot.src}
                    type="button"
                    onClick={() => setLightbox(shot)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="group relative text-left rounded-2xl overflow-hidden border border-border bg-surface-light/30 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all duration-300 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-background">
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-background/80 text-accent backdrop-blur-sm">
                          <ZoomIn size={11} />
                          Click to zoom
                        </span>
                      </div>
                    </div>
                    {shot.caption && (
                      <figcaption className="px-4 py-3 text-xs text-text-muted border-t border-border">
                        {shot.caption}
                      </figcaption>
                    )}
                  </motion.button>
                ))}
              </div>
            </Section>
          )}

          {/* CTA — back to projects + contact */}
          <div className="pt-8 mt-12 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft size={16} />
              Back to all projects
            </Link>
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl border border-border-light hover:border-accent/40 hover:bg-accent/5 hover:text-accent transition-all"
            >
              Want to talk about how this would fit your team?
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </article>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6 sm:p-12 cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute top-5 right-5 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all"
            >
              <X size={20} />
            </button>
            <motion.figure
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center gap-4 cursor-default"
            >
              <div className="relative w-full max-h-[80vh] rounded-2xl overflow-hidden border border-border bg-surface-light/30">
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  width={1600}
                  height={1000}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  priority
                />
              </div>
              {lightbox.caption && (
                <figcaption className="text-center text-sm text-text-muted max-w-2xl">
                  {lightbox.caption}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xs font-medium text-accent mb-3 tracking-[0.2em] uppercase">
        {eyebrow}
      </h2>
      <h3 className="text-2xl sm:text-3xl font-bold mb-5 tracking-tight">
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

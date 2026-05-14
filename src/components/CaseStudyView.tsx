"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Github,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { Project } from "@/data/portfolio";
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

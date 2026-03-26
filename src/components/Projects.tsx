"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ChevronRight, Star, Award, BookOpen, Trophy } from "lucide-react";
import { projects, projectCategories, type Project } from "@/data/portfolio";

const badgeStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Research: {
    bg: "bg-violet-500/10 border-violet-500/20",
    text: "text-violet-400",
    icon: <BookOpen size={10} />,
  },
  "Hackathon Winner": {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    icon: <Trophy size={10} />,
  },
};

function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-xl p-8 glow-hover relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Featured Project
            </span>
          </div>
          <h4 className="text-2xl font-bold mb-2">{project.title}</h4>
          <p className="text-accent/80 text-sm mb-4">{project.subtitle}</p>
          <p className="text-text-secondary leading-relaxed mb-6">
            {project.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Problem
              </h5>
              <p className="text-text-secondary text-sm leading-relaxed">
                {project.problem}
              </p>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Solution
              </h5>
              <p className="text-text-secondary text-sm leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Impact
            </h5>
            <div className="grid sm:grid-cols-2 gap-2">
              {project.impact.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github size={16} />
                Code
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6 glow-hover flex flex-col h-full"
    >
      {project.badge && badgeStyles[project.badge] && (
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeStyles[project.badge].bg} ${badgeStyles[project.badge].text}`}
          >
            {badgeStyles[project.badge].icon}
            {project.badge}
          </span>
        </div>
      )}
      <h4 className="text-lg font-bold mb-1">{project.title}</h4>
      <p className="text-accent/80 text-xs mb-3">{project.subtitle}</p>
      <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-grow">
        {project.description}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Problem
              </h5>
              <p className="text-text-secondary text-sm leading-relaxed">
                {project.problem}
              </p>
            </div>
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Impact
              </h5>
              <div className="space-y-1.5">
                {project.impact.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight size={12} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-xs text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted border border-border"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="View code"
            >
              <Github size={16} />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="View demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("all");

  const featuredProjects = projects.filter((p) => p.featured);
  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Projects
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            What I&apos;ve built.
          </h3>
          <p className="text-text-secondary max-w-xl text-lg mb-10">
            Production systems, cloud architectures, ML pipelines, and published research — each solving real problems with measurable impact.
          </p>
        </motion.div>

        {/* Featured */}
        <div className="space-y-6 mb-14">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {projectCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`text-xs px-4 py-1.5 rounded-full transition-all duration-300 ${
                activeFilter === cat.id
                  ? "bg-accent text-background"
                  : "border border-border text-text-secondary hover:border-border-light hover:text-text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

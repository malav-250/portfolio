"use client";

import { useState, useRef, MouseEvent, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Github,
  ChevronRight,
  Star,
  BookOpen,
  Trophy,
  X,
  ArrowRight,
} from "lucide-react";
import { projects, projectCategories, type Project } from "@/data/portfolio";
import { trackEvent } from "@/hooks/useAnalytics";

/* ── Badge Styles ─────────────────────────────────────────────── */
const badgeStyles: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
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

/* ── Tilt Card Hook ───────────────────────────────────────────── */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale3d(1.02, 1.02, 1.02)`;
    el.style.setProperty("--card-mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--card-mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

/* ── Project Modal ────────────────────────────────────────────── */
function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-card rounded-2xl p-8 sm:p-10 z-10"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-all"
        >
          <X size={18} />
        </button>

        {/* Badge */}
        {project.badge && badgeStyles[project.badge] && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border mb-4 ${badgeStyles[project.badge].bg} ${badgeStyles[project.badge].text}`}
          >
            {badgeStyles[project.badge].icon}
            {project.badge}
          </span>
        )}

        <h3 className="text-2xl sm:text-3xl font-bold mb-2">
          {project.title}
        </h3>
        <p className="text-accent/80 text-sm mb-6">{project.subtitle}</p>

        <p className="text-text-secondary leading-relaxed mb-8">
          {project.description}
        </p>

        {/* Problem / Solution */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-surface-light/50 border border-border">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Problem
            </h5>
            <p className="text-text-secondary text-sm leading-relaxed">
              {project.problem}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface-light/50 border border-border">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Solution
            </h5>
            <p className="text-text-secondary text-sm leading-relaxed">
              {project.solution}
            </p>
          </div>
        </div>

        {/* Impact */}
        <div className="mb-8">
          <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Impact
          </h5>
          <div className="grid sm:grid-cols-2 gap-3">
            {project.impact.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/[0.03] border border-accent/10"
              >
                <ChevronRight
                  size={14}
                  className="text-accent mt-0.5 shrink-0"
                />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Tech Stack
          </h5>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("project_click", {
                  projectSlug: project.id,
                  surface: "modal",
                  link: "github",
                })
              }
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              <Github size={16} />
              View Code
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("project_click", {
                  projectSlug: project.id,
                  surface: "modal",
                  link: "live",
                })
              }
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Featured Project Card ────────────────────────────────────── */
function FeaturedProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (p: Project) => void;
}) {
  const tilt = useTilt();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="card-spotlight glass-card rounded-2xl p-8 sm:p-10 glow-hover relative overflow-hidden group cursor-pointer"
        style={{ transition: "transform 0.15s ease" }}
        onClick={() => {
          trackEvent("project_click", { projectSlug: project.id, surface: "card" });
          onSelect(project);
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Featured Project
            </span>
          </div>
          <h4 className="text-2xl sm:text-3xl font-bold mb-2">{project.title}</h4>
          <p className="text-accent/80 text-sm mb-5">{project.subtitle}</p>
          <p className="text-text-secondary leading-relaxed mb-8 max-w-3xl">
            {project.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {project.impact.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight
                  size={14}
                  className="text-accent mt-0.5 shrink-0"
                />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-3 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github size={16} />
                Code
              </a>
            )}
            <span className="flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all">
              View Details <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Regular Project Card ─────────────────────────────────────── */
function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (p: Project) => void;
}) {
  const tilt = useTilt();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="card-spotlight glass-card rounded-2xl p-6 glow-hover flex flex-col h-full cursor-pointer group"
        style={{ transition: "transform 0.15s ease" }}
        onClick={() => {
          trackEvent("project_click", { projectSlug: project.id, surface: "card" });
          onSelect(project);
        }}
      >
        {project.badge && badgeStyles[project.badge] && (
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${badgeStyles[project.badge].bg} ${badgeStyles[project.badge].text}`}
            >
              {badgeStyles[project.badge].icon}
              {project.badge}
            </span>
          </div>
        )}
        <h4 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors">
          {project.title}
        </h4>
        <p className="text-accent/70 text-xs mb-3">{project.subtitle}</p>
        <p className="text-text-secondary text-sm leading-relaxed mb-5 flex-grow line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted border border-border group-hover:border-accent/20 transition-colors"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted border border-border">
              +{project.techStack.length - 5}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="View demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          <span className="text-xs text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
            Details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featuredProjects = projects.filter((p) => p.featured);
  const nonFeatured = projects.filter((p) => !p.featured);
  const filteredProjects =
    activeFilter === "all"
      ? nonFeatured
      : nonFeatured.filter((p) => p.categories.includes(activeFilter));

  return (
    <section id="projects" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Projects
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            What I&apos;ve built.
          </h3>
          <p className="text-text-secondary max-w-xl text-lg mb-12">
            Backend services, cloud infrastructure, and distributed systems —
            each with real architecture decisions and measurable outcomes.
          </p>
        </motion.div>

        {/* Featured */}
        <div className="space-y-8 mb-16">
          {featuredProjects.map((project) => (
            <FeaturedProjectCard
              key={project.id}
              project={project}
              onSelect={setSelectedProject}
            />
          ))}
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {projectCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`text-xs px-5 py-2 rounded-xl transition-all duration-300 font-medium ${
                activeFilter === cat.id
                  ? "bg-accent text-background shadow-[0_0_20px_rgba(6,182,212,0.2)]"
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
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

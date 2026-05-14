"use client";

import { useState, useRef, MouseEvent, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Github,
  ChevronRight,
  Star,
  BookOpen,
  Trophy,
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
      el.style.transform =
        "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

/* ── Featured Project Card ────────────────────────────────────── */
function FeaturedProjectCard({ project }: { project: Project }) {
  const tilt = useTilt();
  const router = useRouter();

  const openCaseStudy = () => {
    trackEvent("project_click", {
      projectSlug: project.id,
      surface: "featured_card",
    });
    router.push(`/projects/${project.id}`);
  };

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
        onClick={openCaseStudy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCaseStudy();
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View case study: ${project.title}`}
        className="card-spotlight glass-card rounded-2xl p-8 sm:p-10 glow-hover relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
        style={{ transition: "transform 0.15s ease" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Featured Project
            </span>
          </div>
          <h4 className="text-2xl sm:text-3xl font-bold mb-2">
            {project.title}
          </h4>
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
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent("project_click", {
                    projectSlug: project.id,
                    surface: "featured_card",
                    link: "github",
                  });
                }}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github size={16} />
                Code
              </a>
            )}
            <span className="flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all font-medium">
              View Case Study <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Regular Project Card ─────────────────────────────────────── */
function ProjectCard({ project }: { project: Project }) {
  const tilt = useTilt();
  const router = useRouter();

  const openCaseStudy = () => {
    trackEvent("project_click", {
      projectSlug: project.id,
      surface: "grid_card",
    });
    router.push(`/projects/${project.id}`);
  };

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
        onClick={openCaseStudy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCaseStudy();
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View case study: ${project.title}`}
        className="card-spotlight glass-card rounded-2xl p-6 glow-hover flex flex-col h-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-accent/40"
        style={{ transition: "transform 0.15s ease" }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent("project_click", {
                    projectSlug: project.id,
                    surface: "grid_card",
                    link: "github",
                  });
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent("project_click", {
                    projectSlug: project.id,
                    surface: "grid_card",
                    link: "live",
                  });
                }}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="View demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          <span className="text-xs text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
            Case study <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("all");

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
            Click any project for a full case study.
          </p>
        </motion.div>

        {/* Featured */}
        <div className="space-y-8 mb-16">
          {featuredProjects.map((project) => (
            <FeaturedProjectCard key={project.id} project={project} />
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
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
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

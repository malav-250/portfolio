"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  ChevronRight,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { experiences, education } from "@/data/portfolio";

export default function Experience() {
  return (
    <section id="experience" className="py-32 relative">
      <div className="section-divider max-w-6xl mx-auto mb-32" />
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Experience
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-5 tracking-tight">
            Where I&apos;ve worked.
          </h3>
          <p className="text-text-secondary max-w-2xl mb-4 leading-relaxed">
            University research in India, then two internships at the same
            company there, then a co-op in New York. Listed newest first.
          </p>
          {/* Trajectory strip — makes the progression legible without
              reordering the timeline away from reverse-chronological. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-12 text-xs">
            {[
              { label: "Research", place: "India", meta: "9 mo" },
              { label: "Industry", place: "India", meta: "3 + 5 mo" },
              { label: "Co-op", place: "New York", meta: "5 mo" },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-light border border-border">
                  <span className="font-medium text-text-primary">
                    {step.label}
                  </span>
                  <span className="text-text-muted">
                    {step.place} &middot; {step.meta}
                  </span>
                </span>
                {i < arr.length - 1 && (
                  <span className="text-text-muted" aria-hidden="true">
                    &rarr;
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line - animated gradient */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px md:left-1/2 md:-translate-x-px overflow-hidden">
            <motion.div
              className="w-full h-full bg-gradient-to-b from-accent/50 via-accent-secondary/30 to-transparent"
              initial={{ scaleY: 0, transformOrigin: "top" }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-14">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[12px] top-2 w-[15px] h-[15px] rounded-full border-2 border-accent bg-background z-10 md:left-1/2 md:-translate-x-1/2" />

                {/* Content card — one per company, containing every role held there */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-3rem)] ${
                    i % 2 === 0 ? "" : "md:text-right"
                  }`}
                >
                  <div className="glass-card rounded-2xl p-6 glow-hover group">
                    {/* Company header */}
                    <div
                      className={`flex items-center gap-2 mb-1 ${
                        i % 2 !== 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <Briefcase size={14} className="text-accent shrink-0" />
                      <h4 className="text-lg font-bold group-hover:text-accent transition-colors">
                        {exp.company}
                      </h4>
                      {exp.roles.length > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                          {exp.roles.length} roles
                        </span>
                      )}
                    </div>

                    {/* Location — country called out so India -> US reads at a glance */}
                    <div
                      className={`flex items-center gap-1.5 text-xs text-text-muted mb-3 ${
                        i % 2 !== 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <MapPin size={11} className="shrink-0" />
                      <span>{exp.location}</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-light border border-border text-[10px] text-text-secondary">
                        {exp.region}
                      </span>
                    </div>

                    {exp.note && (
                      <p className="text-xs text-text-secondary/90 italic mb-5">
                        {exp.note}
                      </p>
                    )}

                    {/* Roles */}
                    <div className="space-y-6">
                      {exp.roles.map((role, r) => (
                        <div
                          key={role.role + role.period}
                          className={
                            r > 0 ? "pt-5 border-t border-border" : undefined
                          }
                        >
                          <p className="text-sm font-semibold text-text-primary">
                            {role.role}
                          </p>
                          <div
                            className={`flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 mb-3 text-xs ${
                              i % 2 !== 0 ? "md:justify-end" : ""
                            }`}
                          >
                            <span className="text-accent font-medium">
                              {role.period}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-light border border-border text-text-secondary">
                              <Clock size={10} />
                              {role.duration}
                            </span>
                          </div>

                          <div
                            className={`space-y-2.5 mb-4 ${
                              i % 2 !== 0 ? "md:text-left" : ""
                            }`}
                          >
                            {role.achievements.map((achievement, j) => (
                              <motion.div
                                key={j}
                                initial={{
                                  opacity: 0,
                                  x: i % 2 === 0 ? -10 : 10,
                                }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 + j * 0.07 }}
                                className="flex items-start gap-2"
                              >
                                <ChevronRight
                                  size={12}
                                  className="text-accent mt-1 shrink-0"
                                />
                                <span className="text-xs text-text-secondary leading-relaxed">
                                  {achievement}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          {role.links && role.links.length > 0 && (
                            <div
                              className={`flex flex-wrap gap-2 mb-4 ${
                                i % 2 !== 0 ? "md:justify-end" : ""
                              }`}
                            >
                              {role.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                                >
                                  {link.label}
                                  <ArrowUpRight size={11} />
                                </Link>
                              ))}
                            </div>
                          )}

                          <div
                            className={`flex flex-wrap gap-1.5 ${
                              i % 2 !== 0 ? "md:justify-end" : ""
                            }`}
                          >
                            {role.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] px-2.5 py-0.5 rounded-lg bg-accent/10 text-accent/80 border border-accent/20"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mt-24"
        >
          <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
            <GraduationCap size={24} className="text-accent" />
            Education
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, i) => (
              <motion.div
                key={edu.school}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 glow-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold group-hover:text-accent transition-colors">
                    {edu.school}
                  </h4>
                  {edu.gpa && (
                    <span className="text-xs px-3 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20 font-medium">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm mb-1">
                  {edu.degree}
                </p>
                <p className="text-text-muted text-xs mb-4">
                  {edu.location} &middot; {edu.period}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {edu.coursework.map((course) => (
                    <span
                      key={course}
                      className="text-[10px] px-2.5 py-0.5 rounded-lg bg-surface-light text-text-muted border border-border"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

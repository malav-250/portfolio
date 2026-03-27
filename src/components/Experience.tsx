"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, ChevronRight } from "lucide-react";
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
          <h3 className="text-3xl sm:text-5xl font-bold mb-12 tracking-tight">
            Where I&apos;ve worked.
          </h3>
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
                key={exp.company + exp.role}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[12px] top-2 w-[15px] h-[15px] rounded-full border-2 border-accent bg-background z-10 md:left-1/2 md:-translate-x-1/2">
                  {exp.current && (
                    <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-3rem)] ${
                    i % 2 === 0 ? "" : "md:text-right"
                  }`}
                >
                  <div className="glass-card rounded-2xl p-6 glow-hover group">
                    <div
                      className={`flex items-center gap-2 mb-2 ${
                        i % 2 !== 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <Briefcase size={14} className="text-accent" />
                      <span className="text-xs text-accent font-medium">
                        {exp.period}
                      </span>
                      {exp.current && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold group-hover:text-accent transition-colors">
                      {exp.role}
                    </h4>
                    <p className="text-text-secondary text-sm mb-5">
                      {exp.company} &middot; {exp.location}
                    </p>
                    <div
                      className={`space-y-2.5 mb-5 ${
                        i % 2 !== 0 ? "md:text-left" : ""
                      }`}
                    >
                      {exp.achievements.map((achievement, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + j * 0.08 }}
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
                    <div
                      className={`flex flex-wrap gap-1.5 ${
                        i % 2 !== 0 ? "md:justify-end" : ""
                      }`}
                    >
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2.5 py-0.5 rounded-lg bg-accent/10 text-accent/80 border border-accent/20"
                        >
                          {tech}
                        </span>
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

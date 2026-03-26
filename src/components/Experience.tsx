"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, ChevronRight } from "lucide-react";
import { experiences, education } from "@/data/portfolio";

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Experience
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Where I&apos;ve worked.
          </h3>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-px" />

          {/* Experience items */}
          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
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
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-3rem)] ${
                  i % 2 === 0 ? "" : "md:text-right"
                }`}>
                  <div className="glass-card rounded-xl p-6 glow-hover">
                    <div className={`flex items-center gap-2 mb-1 ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      <Briefcase size={14} className="text-accent" />
                      <span className="text-xs text-accent font-medium">
                        {exp.period}
                      </span>
                      {exp.current && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold">{exp.role}</h4>
                    <p className="text-text-secondary text-sm mb-4">
                      {exp.company} &middot; {exp.location}
                    </p>
                    <div className={`space-y-2 mb-4 ${i % 2 !== 0 ? "md:text-left" : ""}`}>
                      {exp.achievements.map((achievement, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <ChevronRight
                            size={12}
                            className="text-accent mt-1 shrink-0"
                          />
                          <span className="text-xs text-text-secondary leading-relaxed">
                            {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={`flex flex-wrap gap-1.5 ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent/80 border border-accent/20"
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
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
                className="glass-card rounded-xl p-6 glow-hover"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold">{edu.school}</h4>
                  {edu.gpa && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm mb-1">{edu.degree}</p>
                <p className="text-text-muted text-xs mb-4">
                  {edu.location} &middot; {edu.period}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {edu.coursework.map((course) => (
                    <span
                      key={course}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted border border-border"
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

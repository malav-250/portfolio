"use client";

import { motion } from "framer-motion";
import { Code, Layers, Cloud, Database, Brain, Settings } from "lucide-react";
import { skills } from "@/data/portfolio";

const iconMap: Record<string, React.ReactNode> = {
  code: <Code size={20} />,
  layers: <Layers size={20} />,
  cloud: <Cloud size={20} />,
  database: <Database size={20} />,
  brain: <Brain size={20} />,
  settings: <Settings size={20} />,
};

export default function Skills() {
  return (
    <section id="skills" className="py-24 relative">
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Skills
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Technical toolkit.
          </h3>
          <p className="text-text-secondary max-w-xl text-lg mb-14">
            Full-stack capabilities spanning backend systems, cloud infrastructure, and machine learning.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((category, i) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-xl p-6 glow-hover group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                  {iconMap[category.icon]}
                </div>
                <h4 className="font-semibold text-sm">{category.title}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface-light text-text-secondary border border-border hover:border-accent/30 hover:text-accent transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

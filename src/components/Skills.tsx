"use client";

import { useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import { Code, Layers, Cloud, Database, Shield } from "lucide-react";
import { skills } from "@/data/portfolio";

const iconMap: Record<string, React.ReactNode> = {
  code: <Code size={20} />,
  layers: <Layers size={20} />,
  cloud: <Cloud size={20} />,
  database: <Database size={20} />,
  shield: <Shield size={20} />,
};

function SkillCard({
  category,
  index,
}: {
  category: (typeof skills)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--card-mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--card-mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="card-spotlight glass-card rounded-2xl p-6 glow-hover group h-full"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
            {iconMap[category.icon]}
          </div>
          <h4 className="font-semibold text-sm">{category.title}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 + i * 0.03 }}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-light text-text-secondary border border-border hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all duration-300 cursor-default"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-32 relative">
      <div className="section-divider max-w-6xl mx-auto mb-32" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Skills
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            Technical toolkit.
          </h3>
          <p className="text-text-secondary max-w-xl text-lg mb-16">
            Backend systems, cloud infrastructure, and the tooling to ship them
            reliably.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((category, i) => (
            <SkillCard key={category.title} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

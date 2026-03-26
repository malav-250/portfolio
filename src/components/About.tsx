"use client";

import { motion } from "framer-motion";
import { Server, Cloud, Brain } from "lucide-react";
import { aboutContent } from "@/data/portfolio";

const iconMap: Record<string, React.ReactNode> = {
  server: <Server size={24} />,
  cloud: <Cloud size={24} />,
  brain: <Brain size={24} />,
};

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            About
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Engineer who ships.
          </h3>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed mb-14">
            {aboutContent.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {aboutContent.highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 glow-hover group"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                {iconMap[item.icon]}
              </div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

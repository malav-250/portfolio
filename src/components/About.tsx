"use client";

import { useRef, MouseEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Server, Cloud, Database } from "lucide-react";
import { aboutContent } from "@/data/portfolio";

const iconMap: Record<string, React.ReactNode> = {
  server: <Server size={24} />,
  cloud: <Cloud size={24} />,
  database: <Database size={24} />,
};

function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
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
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight glass-card rounded-2xl p-8 glow-hover group ${className}`}
    >
      {children}
    </div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" className="py-32 relative" ref={sectionRef}>
      <div className="section-divider max-w-6xl mx-auto mb-32" />
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            About
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            Backend engineer who ships.
          </h3>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed mb-16">
            {aboutContent.description}
          </p>
        </motion.div>

        <motion.div style={{ y }} className="grid md:grid-cols-3 gap-6">
          {aboutContent.highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <SpotlightCard>
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-5 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  {iconMap[item.icon]}
                </div>
                <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, MapPin, ArrowUpRight } from "lucide-react";
import { personalInfo } from "@/data/portfolio";

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Contact
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Let&apos;s connect.
          </h3>
          <p className="text-text-secondary text-lg mb-12 leading-relaxed">
            Open to opportunities in software engineering, backend systems, cloud infrastructure, and ML. Let&apos;s talk about how I can contribute to your team.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <a
              href={`mailto:${personalInfo.email}`}
              className="glass-card rounded-xl p-5 glow-hover flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                <Mail size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">Email</p>
                <p className="text-sm text-text-primary">{personalInfo.email}</p>
              </div>
              <ArrowUpRight
                size={14}
                className="ml-auto text-text-muted group-hover:text-accent transition-colors"
              />
            </a>

            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-5 glow-hover flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                <Linkedin size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">LinkedIn</p>
                <p className="text-sm text-text-primary">Malav Gajera</p>
              </div>
              <ArrowUpRight
                size={14}
                className="ml-auto text-text-muted group-hover:text-accent transition-colors"
              />
            </a>

            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-5 glow-hover flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                <Github size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">GitHub</p>
                <p className="text-sm text-text-primary">malav-250</p>
              </div>
              <ArrowUpRight
                size={14}
                className="ml-auto text-text-muted group-hover:text-accent transition-colors"
              />
            </a>

            <div className="glass-card rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">Location</p>
                <p className="text-sm text-text-primary">{personalInfo.location}</p>
              </div>
            </div>
          </div>

          <a
            href={`mailto:${personalInfo.email}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-all duration-300 text-sm"
          >
            <Mail size={16} />
            Send me an email
          </a>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, MapPin, ArrowUpRight } from "lucide-react";
import { personalInfo } from "@/data/portfolio";
import { trackEvent } from "@/hooks/useAnalytics";

const contactLinks = [
  {
    href: `mailto:${personalInfo.email}`,
    icon: <Mail size={18} />,
    label: "Email",
    value: personalInfo.email,
    external: false,
  },
  {
    href: personalInfo.linkedin,
    icon: <Linkedin size={18} />,
    label: "LinkedIn",
    value: "Malav Gajera",
    external: true,
  },
  {
    href: personalInfo.github,
    icon: <Github size={18} />,
    label: "GitHub",
    value: "malav-250",
    external: true,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-32 relative">
      <div className="section-divider max-w-6xl mx-auto mb-32" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Contact
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            Let&apos;s connect.
          </h3>
          <p className="text-text-secondary text-lg mb-14 leading-relaxed">
            Looking for backend and cloud engineering roles starting August 2026.
            Let&apos;s talk about how I can contribute to your team.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {contactLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() =>
                  trackEvent("contact_click", {
                    source: "contact_section",
                    channel: link.label.toLowerCase(),
                  })
                }
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5 glow-hover flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  {link.icon}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">
                    {link.label}
                  </p>
                  <p className="text-sm text-text-primary font-medium">
                    {link.value}
                  </p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="ml-auto text-text-muted group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
                />
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  Location
                </p>
                <p className="text-sm text-text-primary font-medium">
                  {personalInfo.location}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.a
            href={`mailto:${personalInfo.email}`}
            onClick={() =>
              trackEvent("contact_click", {
                source: "contact_cta",
                channel: "email",
              })
            }
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-background font-semibold rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Mail size={16} />
              Send me an email
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

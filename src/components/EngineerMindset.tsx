"use client";

import { motion } from "framer-motion";
import { Cpu, Shield, Zap, GitBranch, BarChart3, Layers } from "lucide-react";

const principles = [
  {
    icon: <Layers size={22} />,
    title: "Design for Scale",
    description:
      "Microservices, message queues, and horizontal scaling — architectures that grow with demand, not break under it.",
    metric: "99.9% uptime",
  },
  {
    icon: <Shield size={22} />,
    title: "Security First",
    description:
      "IAM least-privilege, JWT/OAuth2, encrypted data at rest and in transit. Security is not an afterthought.",
    metric: "Zero breaches",
  },
  {
    icon: <Zap size={22} />,
    title: "Performance Obsessed",
    description:
      "Sub-200ms APIs, optimized queries, Redis caching, connection pooling — every millisecond matters at scale.",
    metric: "<200ms p99",
  },
  {
    icon: <GitBranch size={22} />,
    title: "Ship with Confidence",
    description:
      "CI/CD pipelines, automated testing, blue-green deployments — zero-downtime releases as a standard.",
    metric: "Zero-downtime",
  },
  {
    icon: <Cpu size={22} />,
    title: "Infrastructure as Code",
    description:
      "Terraform modules, Packer AMIs, reproducible environments — infrastructure that's version-controlled and auditable.",
    metric: "100% IaC",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Data-Driven Decisions",
    description:
      "CloudWatch metrics, W&B dashboards, structured logging — observability that turns incidents into insights.",
    metric: "Full observability",
  },
];

const terminalLines = [
  { prompt: true, text: "cat system_design.yaml" },
  { prompt: false, text: "architecture: microservices" },
  { prompt: false, text: "database: PostgreSQL (RDS Multi-AZ)" },
  { prompt: false, text: "cache: Redis (ElastiCache)" },
  { prompt: false, text: "compute: Auto Scaling Group (1-3)" },
  { prompt: false, text: "networking: VPC, 3 AZs, private subnets" },
  { prompt: false, text: "ci_cd: GitHub Actions → Packer → AMI" },
  { prompt: false, text: "monitoring: CloudWatch + SNS alerts" },
  { prompt: false, text: "security: IAM roles, least-privilege" },
  { prompt: true, text: "terraform plan | tail -1" },
  {
    prompt: false,
    text: "Plan: 47 to add, 0 to change, 0 to destroy.",
    highlight: true,
  },
  { prompt: true, text: "curl -s api/health | jq .status" },
  { prompt: false, text: '"healthy"', highlight: true },
];

export default function EngineerMindset() {
  return (
    <section className="py-32 relative">
      <div className="section-divider max-w-6xl mx-auto mb-32" />
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
            Philosophy
          </h2>
          <h3 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            How I think about systems.
          </h3>
          <p className="text-text-secondary max-w-2xl text-lg mb-16">
            Building production software isn&apos;t just about writing code —
            it&apos;s about designing systems that are reliable, secure,
            observable, and built to evolve.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Principles grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5 glow-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-mono text-accent/60 px-2 py-0.5 rounded-md bg-accent/5 border border-accent/10">
                    {p.metric}
                  </span>
                </div>
                <h4 className="text-sm font-semibold mb-2">{p.title}</h4>
                <p className="text-text-muted text-xs leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="terminal sticky top-24 overflow-hidden">
              <div className="terminal-header">
                <div className="terminal-dot bg-red-500/80" />
                <div className="terminal-dot bg-yellow-500/80" />
                <div className="terminal-dot bg-green-500/80" />
                <span className="ml-3 text-[10px] text-text-muted font-mono">
                  system-architecture
                </span>
              </div>
              <div className="p-4 text-xs space-y-1 font-mono max-h-[480px] overflow-y-auto">
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className={`${line.highlight ? "text-emerald-400" : line.prompt ? "text-text-secondary" : "text-text-muted"}`}
                  >
                    {line.prompt && (
                      <span className="text-accent mr-2">$</span>
                    )}
                    {!line.prompt && <span className="mr-4" />}
                    {line.text}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center mt-2"
                >
                  <span className="text-accent mr-2">$</span>
                  <span className="w-2 h-4 bg-accent/60 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

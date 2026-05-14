"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { BlogPost } from "@/data/blog";
import "highlight.js/styles/github-dark.css";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      {/* Sticky back nav */}
      <div className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} />
            All posts
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="pt-16 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
              <time className="text-text-muted">
                {formatDate(post.publishedAt)}
              </time>
              <span className="text-text-muted">·</span>
              <span className="inline-flex items-center gap-1 text-text-muted">
                <Clock size={12} />
                {post.readingTime}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-accent/5 border border-accent/15 text-accent text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-5">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-lg text-text-secondary leading-relaxed">
                {post.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <article className="px-6 pb-24">
        <div className="max-w-3xl mx-auto prose-blog">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* CTA */}
      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} />
            More posts
          </Link>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl border border-border-light hover:border-accent/40 hover:bg-accent/5 hover:text-accent transition-all"
          >
            Want to talk backend systems with someone who actually ships?
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}

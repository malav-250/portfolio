import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import CursorGlow from "@/components/CursorGlow";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog | Malav Gajera",
  description:
    "Notes on backend systems, distributed infrastructure, and the architecture decisions behind them.",
  openGraph: {
    title: "Blog | Malav Gajera",
    description:
      "Notes on backend systems, distributed infrastructure, and the architecture decisions behind them.",
    type: "website",
    url: "https://malavgajera.is-a.dev/blog",
    images: [{ url: "/og/portfolio.png", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://malavgajera.is-a.dev/blog" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return (
    <>
      <CursorGlow />
      <main className="min-h-screen bg-background text-text-primary">
        {/* Sticky back nav */}
        <div className="sticky top-0 z-40 glass border-b border-border">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
          </div>
        </div>

        {/* Header */}
        <section className="pt-20 pb-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-medium text-accent mb-3 tracking-wider uppercase">
              Writing
            </h2>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              Notes on backend systems.
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              Long-form posts on the design decisions that don&apos;t fit in a
              README — distributed systems, queueing, IaC trade-offs, and the
              quiet failure modes nobody warns you about.
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="px-6 pb-32">
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block glass-card rounded-2xl p-7 sm:p-9 hover:border-accent/30 transition-all duration-300 border border-border"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                  <time className="text-text-muted">
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="text-text-muted">·</span>
                  <span className="inline-flex items-center gap-1 text-text-muted">
                    <Clock size={12} />
                    {post.readingTime}
                  </span>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-accent/5 border border-accent/15 text-accent text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                {post.subtitle && (
                  <p className="text-accent/80 text-sm mb-4">{post.subtitle}</p>
                )}
                <p className="text-text-secondary leading-relaxed mb-5">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent font-medium group-hover:gap-2 transition-all">
                  Read post
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

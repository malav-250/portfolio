import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CursorGlow from "@/components/CursorGlow";
import Footer from "@/components/Footer";
import BlogPostView from "@/components/BlogPostView";
import { blogPosts } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} | Malav Gajera`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://malavgajera.is-a.dev/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      authors: ["Malav Gajera"],
      tags: post.tags,
      images: [{ url: "/og/portfolio.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://malavgajera.is-a.dev/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  // BlogPosting JSON-LD: tells Google "this is an article by Malav Gajera,
  // published on X, about Y". Eligible for Article rich results in search.
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: "https://malavgajera.is-a.dev/og/portfolio.png",
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: "Malav Gajera",
      url: "https://malavgajera.is-a.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Malav Gajera",
    },
    keywords: post.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://malavgajera.is-a.dev/blog/${post.slug}`,
    },
  };

  return (
    <>
      <CursorGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      <BlogPostView post={post} />
      <Footer />
    </>
  );
}

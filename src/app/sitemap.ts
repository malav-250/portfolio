import type { MetadataRoute } from "next";
import { projects } from "@/data/portfolio";
import { blogPosts } from "@/data/blog";

const SITE = "https://malavgajera.is-a.dev";

// Helper: prefer build-time timestamp for static pages, fall back to today.
const buildDate = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/blog`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE}/projects/${p.id}`,
    lastModified: buildDate,
    changeFrequency: "monthly" as const,
    priority: p.featured ? 0.9 : 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    // Use the post's published date as the lastModified hint.
    lastModified: new Date(post.publishedAt).toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

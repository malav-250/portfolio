import type { MetadataRoute } from "next";

const SITE = "https://malavgajera.is-a.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Everything is crawlable by default — this is a public portfolio.
        allow: "/",
        // Hide the admin dashboard + tracking API endpoints from search
        // engines. They're authenticated/internal; no SEO value in indexing them.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

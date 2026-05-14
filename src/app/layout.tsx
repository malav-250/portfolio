import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://malavgajera.is-a.dev"),
  title: "Malav Gajera | Backend & Cloud Engineer",
  description:
    "Backend & Cloud Engineer. MS in Software Engineering @ Northeastern (3.9 GPA, Dec 2026). Software Engineer Co-op @ Crewasis. Open to full-time Jan 2027.",
  keywords: [
    "Malav Gajera",
    "Malav Gajera GitHub",
    "Malav Gajera Northeastern",
    "Malav Gajera portfolio",
    "Backend Engineer",
    "Cloud Engineer",
    "Software Engineer Co-op",
    "Northeastern University",
    "FastAPI",
    "Django",
    "Spring Boot",
    "AWS",
    "Terraform",
  ],
  alternates: {
    canonical: "https://malavgajera.is-a.dev",
  },
  openGraph: {
    title: "Malav Gajera | Backend & Cloud Engineer",
    description:
      "MS @ Northeastern (3.9 GPA, Dec 2026). SWE Co-op @ Crewasis. Open to full-time Jan 2027.",
    url: "https://malavgajera.is-a.dev",
    siteName: "Malav Gajera",
    type: "website",
    images: [
      {
        url: "/og/portfolio.png",
        width: 1200,
        height: 630,
        alt: "Malav Gajera — Backend & Cloud Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Malav Gajera | Backend & Cloud Engineer",
    description: "MS @ Northeastern · SWE Co-op @ Crewasis · Open Jan 2027",
    images: ["/og/portfolio.png"],
  },
};

// Person + WebSite structured data — gives Google a strong signal to build a
// knowledge-graph card for "Malav Gajera" and links every important profile
// together. Spec: https://schema.org/Person
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Malav Gajera",
  alternateName: ["Malav Jigneshbhai Gajera"],
  jobTitle: "Software Engineer Co-op",
  description:
    "Backend & Cloud Engineer. MS in Computer Software Engineering at Northeastern University, graduating December 2026. Open to full-time backend/cloud roles starting January 2027.",
  url: "https://malavgajera.is-a.dev",
  image: "https://malavgajera.is-a.dev/og/portfolio.png",
  email: "mailto:gajera.ma@northeastern.edu",
  worksFor: {
    "@type": "Organization",
    name: "Crewasis",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Northeastern University",
      sameAs: "https://www.northeastern.edu/",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Nirma University",
      sameAs: "https://nirmauni.ac.in/",
    },
  ],
  knowsAbout: [
    "Backend Engineering",
    "Cloud Infrastructure",
    "Distributed Systems",
    "Python",
    "Java",
    "Spring Boot",
    "FastAPI",
    "Django",
    "AWS",
    "Terraform",
    "PostgreSQL",
    "Celery",
    "RabbitMQ",
    "Prometheus",
    "Grafana",
  ],
  sameAs: [
    "https://github.com/malav-250",
    "https://www.linkedin.com/in/malav-gajera-884003202/",
  ],
};

// WebSite schema with potentialAction for site search (forward-compatible:
// even though we don't have on-site search yet, declaring the schema is
// cheap and helps Google understand the site identity).
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Malav Gajera — Portfolio",
  url: "https://malavgajera.is-a.dev",
  author: {
    "@type": "Person",
    name: "Malav Gajera",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD structured data. Inline content is generated server-side
            from constants above; no external/user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        {/* Analytics: behavioral component, renders nothing.
            Suspense boundary required because useAnalytics calls usePathname(). */}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Malav Gajera | Backend & Cloud Engineer",
    description: "MS @ Northeastern · SWE Co-op @ Crewasis · Open Jan 2027",
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

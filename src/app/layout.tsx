import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malav Gajera | Software Engineer",
  description:
    "Software Engineer specializing in scalable backend systems, cloud-native architectures, and ML pipelines. MS in Computer Software Engineering at Northeastern University.",
  keywords: [
    "Software Engineer",
    "Backend Developer",
    "Cloud Engineer",
    "ML Engineer",
    "Full Stack Developer",
    "Malav Gajera",
  ],
  openGraph: {
    title: "Malav Gajera | Software Engineer",
    description:
      "Building scalable systems and intelligent applications. Backend, Cloud, and ML expertise.",
    type: "website",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { projects } from "@/data/portfolio";

// Pre-generate a static page for every project at build time.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

// Map each project to the page screenshot we fetched in /public/screenshots/.
// These are used as Open Graph cards when the case study is shared on
// LinkedIn / Twitter / Slack — recruiters see a real page render, not a
// generic site icon.
const PROJECT_OG_IMAGES: Record<string, string> = {
  "distributed-task-queue": "/screenshots/task-queue.png",
  "voice-agent": "/screenshots/voice-agent.png",
  "cloud-native-app": "/screenshots/cloud-infra.png",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) {
    return { title: "Project not found" };
  }
  const ogImage = PROJECT_OG_IMAGES[slug] ?? "/og/portfolio.png";
  return {
    title: `${project.title} | Malav Gajera`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Malav Gajera`,
      description: project.description,
      type: "article",
      url: `https://malavgajera.is-a.dev/projects/${project.id}`,
      images: [
        {
          url: ogImage,
          alt: `${project.title} case study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.subtitle,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://malavgajera.is-a.dev/projects/${project.id}`,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();

  const ogImage = PROJECT_OG_IMAGES[slug] ?? "/og/portfolio.png";

  // SoftwareSourceCode + CreativeWork JSON-LD for project case studies.
  // Helps Google surface case-study pages for queries like
  // "<technology> portfolio project" and link projects to their repos.
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    abstract: project.subtitle,
    image: `https://malavgajera.is-a.dev${ogImage}`,
    url: `https://malavgajera.is-a.dev/projects/${project.id}`,
    codeRepository: project.github ?? undefined,
    programmingLanguage: project.techStack,
    keywords: project.techStack.join(", "),
    author: {
      "@type": "Person",
      name: "Malav Gajera",
      url: "https://malavgajera.is-a.dev",
    },
  };

  return (
    <>
      <CursorGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <CaseStudyView project={project} />
      <Footer />
    </>
  );
}

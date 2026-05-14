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
  return {
    title: `${project.title} | Malav Gajera`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Malav Gajera`,
      description: project.description,
      type: "article",
      url: `https://malavgajera.is-a.dev/projects/${project.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.subtitle,
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

  return (
    <>
      <CursorGlow />
      <CaseStudyView project={project} />
      <Footer />
    </>
  );
}

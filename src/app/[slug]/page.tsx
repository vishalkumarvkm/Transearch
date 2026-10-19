import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CandidateVoiceView from "@/components/CandidateVoiceView";
import {
  getCandidateConfigBySlug,
  getAllCandidateSlugs,
  CANDIDATE_CONFIGS,
} from "@/lib/agents/candidateRoutes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCandidateSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const config = getCandidateConfigBySlug(slug);

  if (!config) {
    return {
      title: "Executive Briefing | TRANSEARCH International",
      description: "TRANSEARCH International Executive Search & Leadership Consulting Voice Portal.",
    };
  }

  return {
    title: `TRANSEARCH Briefing · ${config.candidateFullName}`,
    description: `Executive leadership briefing for ${config.candidateFullName} regarding a confidential ${config.role} appointment.`,
    openGraph: {
      title: `TRANSEARCH Briefing · ${config.candidateFullName}`,
      description: `Confidential Senior Executive Mandate: ${config.role} (${config.location})`,
      siteName: "TRANSEARCH International",
    },
  };
}

export default async function CandidateSlugPage(props: PageProps) {
  const { slug } = await props.params;
  const config = getCandidateConfigBySlug(slug);

  if (!config) {
    notFound();
  }

  return <CandidateVoiceView config={config} />;
}

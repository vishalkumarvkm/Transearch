import { redirect, notFound } from "next/navigation";
import { getCandidateConfigBySlug } from "@/lib/agents/candidateRoutes";

export default async function AgentSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const config = getCandidateConfigBySlug(slug);

  if (!config) {
    notFound();
  }

  redirect(config.route);
}

import { RepoDocumentation } from "@/components/repo-documentation"
import { getStoredDocs } from "@/lib/docs-storage"
import type { Metadata } from "next"

interface RepoPageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  const { owner, repo } = await params

  return {
    title: `${owner}/${repo} - GitAlchemy Documentation`,
    description: `AI-generated documentation for the ${owner}/${repo} GitHub repository. Explore architecture, quick start guide, and more.`,
    openGraph: {
      title: `${owner}/${repo} - GitAlchemy`,
      description: `AI-generated documentation for ${owner}/${repo}. Understand any codebase with AI.`,
      type: "website",
      siteName: "GitAlchemy",
    },
    twitter: {
      card: "summary_large_image",
      title: `${owner}/${repo} - GitAlchemy`,
      description: `AI-generated documentation for ${owner}/${repo}`,
    },
  }
}

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, repo } = await params

  // Fetch stored documentation server-side (no loading state!)
  const storedDocs = await getStoredDocs(owner, repo) || {}

  return <RepoDocumentation owner={owner} repo={repo} initialDocs={storedDocs} />
}

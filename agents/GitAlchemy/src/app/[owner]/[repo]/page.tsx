import { RepoDocumentation } from "@/components/repo-documentation"
import { getStoredDocs } from "@/lib/docs-storage"

interface RepoPageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, repo } = await params

  // Fetch stored documentation server-side (no loading state!)
  const storedDocs = await getStoredDocs(owner, repo) || {}

  return <RepoDocumentation owner={owner} repo={repo} initialDocs={storedDocs} />
}

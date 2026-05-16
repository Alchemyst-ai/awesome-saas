import { RepoChat } from "@/components/repo-chat"
import type { Metadata } from "next"

interface RepoChatPageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ params }: RepoChatPageProps): Promise<Metadata> {
  const { owner, repo } = await params
  return {
    title: `Chat - ${owner}/${repo} | GitAlchemy`,
  }
}

export default async function RepoChatPage(props: RepoChatPageProps) {
  const { owner, repo } = await props.params
  const resolvedSearchParams = await props.searchParams
  const q = resolvedSearchParams?.q

  return <RepoChat owner={owner} repo={repo} initialQuery={q} />
}

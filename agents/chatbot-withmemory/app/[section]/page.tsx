import { notFound } from 'next/navigation';
import DocsChatClient from '../docs-chat-client';
import { loadDocs } from '../docs-data';

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sections = await loadDocs();
  const isValidSection = sections.some((entry) => entry.id === section);

  if (!isValidSection) {
    notFound();
  }

  return <DocsChatClient sections={sections} initialSectionId={section} />;
}

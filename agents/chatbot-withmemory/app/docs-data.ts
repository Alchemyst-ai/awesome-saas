import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DOC_FILES } from './docs-config';

export type DocSectionData = {
  id: string;
  title: string;
  description: string;
  content: string;
};

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toTitle = (fileName: string): string => {
  const raw = fileName
    .replace(/\.md$/i, '')
    .replace(/^razorpay-api-/, '')
    .replace(/-/g, ' ')
    .trim();
  if (!raw) return 'Merchant API Doc';
  return raw.replace(/\b\w/g, (ch) => ch.toUpperCase());
};

export async function loadDocs(): Promise<DocSectionData[]> {
  const docsDir = path.join(process.cwd(), 'docs');
  const merchantDocsDir = path.join(process.cwd(), 'merchant-docs');

  const coreDocs = await Promise.all(
    DOC_FILES.map(async ({ id, title, fileName, description }) => {
      const filePath = path.join(docsDir, fileName);
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        id,
        title,
        description,
        content,
      };
    }),
  );

  let merchantDocs: DocSectionData[] = [];
  try {
    const entries = await fs.readdir(merchantDocsDir, { withFileTypes: true });
    const mdFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    merchantDocs = await Promise.all(
      mdFiles.map(async (fileName) => {
        const filePath = path.join(merchantDocsDir, fileName);
        const content = await fs.readFile(filePath, 'utf-8');
        const slug = toSlug(fileName);

        return {
          id: `merchant-${slug}`,
          title: `Merchant: ${toTitle(fileName)}`,
          description: 'Merchant-focused Razorpay API guide.',
          content,
        };
      }),
    );
  } catch {
    merchantDocs = [];
  }

  return [...coreDocs, ...merchantDocs];
}

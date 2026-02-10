import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DOC_FILES } from './docs-config';

export type DocSectionData = {
  id: string;
  title: string;
  description: string;
  content: string;
};

export async function loadDocs(): Promise<DocSectionData[]> {
  const docsDir = path.join(process.cwd(), 'docs');

  return Promise.all(
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
}

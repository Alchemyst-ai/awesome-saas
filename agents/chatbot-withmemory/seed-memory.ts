import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { addRazorpayDocs } from './alchemyst-helpers';

const docsDir = path.join(process.cwd(), 'docs');

interface FileDocument {
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    lastModified: string;
    fileSize: number;
  };
}

async function seed(): Promise<void> {
  const entries = await fs.readdir(docsDir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  if (mdFiles.length === 0) {
    console.error(`No markdown files found in ${docsDir}.`);
    process.exit(1);
  }

  const documents: FileDocument[] = await Promise.all(
    mdFiles.map(async (fileName) => {
      const fullPath = path.join(docsDir, fileName);
      const [content, stats] = await Promise.all([
        fs.readFile(fullPath, 'utf8'),
        fs.stat(fullPath),
      ]);

      return {
        content,
        metadata: {
          fileName,
          fileType: 'text/markdown',
          lastModified: stats.mtime.toISOString(),
          fileSize: stats.size,
        },
      };
    })
  );

  await addRazorpayDocs({ documents });
  console.log('✅ Seeded Razorpay documentation into Alchemyst AI.');
}

seed().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error: ${message}`);
  process.exit(1);
});
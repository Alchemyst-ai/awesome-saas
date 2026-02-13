import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { addRazorpayDocs } from './alchemyst-helpers';

const docsDir = path.join(process.cwd(), 'docs');
const merchantDocsDir = path.join(process.cwd(), 'merchant-docs');

interface FileDocument {
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    lastModified: string;
    fileSize: number;
  };
}

async function loadDocumentsFromDir(dir: string): Promise<FileDocument[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  if (mdFiles.length === 0) {
    return [];
  }

  return Promise.all(
    mdFiles.map(async (fileName) => {
      const fullPath = path.join(dir, fileName);
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

}

async function seed(): Promise<void> {
  const [coreDocs, merchantDocs] = await Promise.all([
    loadDocumentsFromDir(docsDir),
    loadDocumentsFromDir(merchantDocsDir),
  ]);

  if (coreDocs.length === 0 && merchantDocs.length === 0) {
    console.error(`No markdown files found in ${docsDir} or ${merchantDocsDir}.`);
    process.exit(1);
  }

  if (coreDocs.length > 0) {
    await addRazorpayDocs({
      documents: coreDocs,
      groupName: ['rzpay', 'docs'],
      sourceLabel: 'razorpay-documentation',
    });
    console.log(`✅ Seeded ${coreDocs.length} core docs from ${docsDir}.`);
  }

  if (merchantDocs.length > 0) {
    await addRazorpayDocs({
      documents: merchantDocs,
      groupName: ['rzpay', 'docs', 'merchat'],
      sourceLabel: 'razorpay-merchant-documentation',
    });
    console.log(`✅ Seeded ${merchantDocs.length} merchant docs from ${merchantDocsDir}.`);
  }
}

seed().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error: ${message}`);
  process.exit(1);
});

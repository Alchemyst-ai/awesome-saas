import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addRazorpayDocs } from './alchemyst-helpers';

const currentFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(currentFilePath);
const docsDir = path.join(projectRoot, 'docs');
const merchantDocsDir = path.join(projectRoot, 'merchant-docs');

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
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const mdFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

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
            fileType: 'text',
            lastModified: stats.mtime.toISOString(),
            fileSize: stats.size,
          },
        };
      })
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Directory not found, skipping: ${dir}`);
      return [];
    }
    throw error;
  }
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
      groupName: ['rzpay', 'docs', 'merchant'],
      sourceLabel: 'razorpay-merchant-documentation',
    });
    console.log(`✅ Seeded ${merchantDocs.length} merchant docs from ${merchantDocsDir}.`);
  }
}

seed().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error seeding docs: ${message}`);
  if (message.toLowerCase().includes('connection')) {
    console.error(
      'Hint: verify network access and that ALCHEMYST_AI_API_KEY is valid in agents/chatbot-withmemory/.env.',
    );
  }
  process.exit(1);
});

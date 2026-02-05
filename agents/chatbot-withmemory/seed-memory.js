import 'dotenv/config';
import AlchemystAI from '@alchemystai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';

const alchemystApiKey = process.env.ALCHEMYST_AI_API_KEY || '';
if (!alchemystApiKey) {
  console.error('Missing env var ALCHEMYST_AI_API_KEY.');
  process.exit(1);
}

const alchemyst = new AlchemystAI({ apiKey: alchemystApiKey });

const docsDir = path.join(process.cwd(), 'docs');

async function seed() {
  const timestamp = new Date().toISOString();
  const entries = await fs.readdir(docsDir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  if (mdFiles.length === 0) {
    console.error(`No markdown files found in ${docsDir}.`);
    process.exit(1);
  }

  const documents = await Promise.all(
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

  await alchemyst.v1.context.add({
    documents,
    context_type: 'resource',
    source: `razorpay-demo-seed-${timestamp}`,
    scope: 'internal',
    metadata: {
      fileName: `razorpay-demo-seed-${timestamp}.txt`,
      fileType: 'text/plain',
      lastModified: timestamp,
      fileSize: documents.reduce((sum, doc) => sum + doc.content.length, 0),
      groupName: ["Razorpay", "docs", "apis"]
    },
  });

  console.log('Seeded Razorpay demo memory into Alchemyst AI.');
}

seed().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error: ${message}`);
  process.exit(1);
});

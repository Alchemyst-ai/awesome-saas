#!/usr/bin/env node
import AlchemystAI from '@alchemystai/sdk';

async function run() {
  const apiKey = process.env.ALCHEMYST_AI_API_KEY;
  if (!apiKey) {
    console.error('ALCHEMYST_AI_API_KEY is not set. Aborting live test.');
    process.exitCode = 2;
    return;
  }

  const client = new AlchemystAI({ apiKey, baseURL: process.env.ALCHEMYST_AI_BASE_URL });

  try {
    console.log('Adding context...');
    const addResp = await client.v1.context.add({
      context_type: 'resource',
      scope: 'internal',
      source: 'v0-prompt-generator-live-test',
      documents: [{ content: JSON.stringify({ test: 'live-context', ts: Date.now() }) }],
      metadata: { fileName: 'live-test.json', fileType: 'application/json' },
    });
    console.log('Add response:', addResp);

    console.log('Searching for context...');
    const searchResp = await client.v1.context.search({
      query: 'live-context',
      minimum_similarity_threshold: 0.1,
      similarity_threshold: 0.9,
      scope: 'internal',
    });
    console.log('Search response:', searchResp);
  } catch (err) {
    console.error('Live test error:', err);
    process.exitCode = 1;
  }
}

run();

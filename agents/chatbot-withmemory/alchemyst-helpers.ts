import 'dotenv/config';
import { streamText, StreamTextResult, ModelMessage } from 'ai';
import { google } from '@ai-sdk/google';
import {openai} from '@ai-sdk/openai';
import { alchemystTools } from '@alchemystai/aisdk';
import AlchemystAI from '@alchemystai/sdk';
import { razorpayNavigationTool } from './navigation-tool';
import { jsonSchema } from 'ai';

const alchemystApiKey = process.env.ALCHEMYST_AI_API_KEY || '';
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

if (!alchemystApiKey || !geminiApiKey) {
  console.error('Missing env vars. Please set ALCHEMYST_AI_API_KEY and GEMINI_API_KEY.');
  process.exit(1);
}

const alchemyst = new AlchemystAI({ apiKey: alchemystApiKey });

interface GenerateRazorpayResponseParams {
  userId: string;
  sessionId: string;
  userMessage: string;
  systemPrompt?: string;
  history?: ModelMessage[];
}

interface SearchRazorpayDocsParams {
  query: string;
  similarityThreshold?: number;
  limit?: number;
}

interface DocumentMetadata {
  fileName?: string;
  fileType?: string;
  lastModified?: string;
  fileSize?: number;
  groupName?: string[];
  source?: string;
  addedAt?: string;
  [key: string]: unknown;
}

interface Document {
  content: string;
  metadata?: DocumentMetadata;
}

interface AddRazorpayDocsParams {
  documents: Document[];
}

interface ContextResult {
  content?: string;
  metadata?: {
    groupName?: string[];
    [key: string]: unknown;
  };
}

/**
 * Generate text response for Razorpay documentation queries with memory
 */
export async function generateRazorpayResponse({
  userId,
  sessionId,
  userMessage,
  systemPrompt,
  history = [],
}: GenerateRazorpayResponseParams): Promise<StreamTextResult<any, any>> {
  const defaultSystemPrompt = `You are a helpful Razorpay documentation assistant.
You provide accurate, concise answers about Razorpay's payment gateway, APIs, webhooks, payouts, refunds, and integrations.

Available tools:
1. alchemyst_context_search - Search documentation content
2. alchemyst_memory_add - Store conversation context
3. razorpay_navigation - Navigate users to specific documentation pages

When users ask about specific topics or want to read more:
- Use razorpay_navigation to find and provide direct links
- Present the primary page link and mention alternatives if available
- Guide users to the exact section they need

Always provide helpful, accurate answers with proper navigation when needed.`;

  const messages: ModelMessage[] = [
    { role: 'system', content: systemPrompt || defaultSystemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const alchemystToolsObj = alchemystTools({ apiKey: alchemystApiKey, groupName : [ 'memory' ]  });

  const convertedTools = Object.entries(alchemystToolsObj).reduce((acc, [name, tool]: [string, any]) => {
  acc[name] = {
    description: tool.description,
    parameters: jsonSchema(tool.parameters), // Convert Zod to JSON Schema
    execute: tool.execute,
  };
  return acc;
}, {} as Record<string, any>);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    // tools: {
    //   razorpay_navigation: razorpayNavigationTool,
    // },
    // tools : alchemystTools({ apiKey: alchemystApiKey, groupName : [ 'memory' ]  }),
    // maxRetries: 5,s
   
    // tools: {
    //   ...convertedTools,
    //   razorpay_navigation: razorpayNavigationTool, // Custom navigation tool
    // },
    // toolChoice: 'auto',
    // onStepFinish: async ({ toolCalls }) => {
    // if (toolCalls && toolCalls.length > 0) {
    //   console.log('[debug] Tool calls:', toolCalls.map(tc => tc.toolName));
      
    //   // Log memory additions
    //   toolCalls.forEach(tc => {
    //     if (tc.toolName === 'add_to_memory') {
    //       console.log('[debug] Memory added:', tc);
    //     }
    //     if (tc.toolName === 'search_context') {
    //       console.log('[debug] Context searched:', tc);
    //     }
      // });
    // }
  // },

  });

  return result;
}

/**
 * Search through Razorpay documentation context
 */
export async function searchRazorpayDocs({
  query,
  similarityThreshold = 0.8,
  limit = 5
}: SearchRazorpayDocsParams): Promise<ContextResult[]> {
  try {
    const response = await alchemyst.v1.context.search({
      query,
      similarity_threshold: similarityThreshold,
      minimum_similarity_threshold: 0.5,
      scope: 'internal'
    });

    const contexts = response.contexts || [];
    const razorpayDocs = contexts
      .filter((ctx: any) => {
        const groupName = ctx.metadata?.groupName || [];
        return groupName.includes('rzpay') && groupName.includes('docs');
      })
      .slice(0, limit)
      .map((ctx: any): ContextResult => ({
        content: ctx.content,
        metadata: ctx.metadata as ContextResult['metadata']
      }));

    return razorpayDocs;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error searching Razorpay docs: ${message}`);
    return [];
  }
}

/**
 * Add Razorpay documentation to context (for seeding)
 */
export async function addRazorpayDocs({ documents }: AddRazorpayDocsParams): Promise<void> {
  const timestamp = new Date().toISOString();
  const latestModified = documents.reduce<Date | null>((latest, doc) => {
    const value = doc.metadata?.lastModified ? new Date(doc.metadata.lastModified) : null;
    if (!value || Number.isNaN(value.getTime())) return latest;
    if (!latest || value > latest) return value;
    return latest;
  }, null);
  const totalFileSize = documents.reduce<number>(
    (sum, doc) => sum + (doc.metadata?.fileSize ?? 0),
    0
  );

  const documentsWithMetadata = documents.map((doc) => ({
    content: doc.content,
    metadata: {
      fileName: doc.metadata?.fileName ?? 'unknown.md',
      fileType: doc.metadata?.fileType ?? 'text/markdown',
      lastModified: doc.metadata?.lastModified ?? timestamp,
      fileSize: doc.metadata?.fileSize ?? 0,
      groupName: ['rzpay', 'docs'],
      source: doc.metadata?.source ?? 'razorpay-documentation',
      addedAt: doc.metadata?.addedAt ?? timestamp,
    },
  })) as any;

  await alchemyst.v1.context.add({
    documents: documentsWithMetadata,
    context_type: 'resource',
    source: `rzpay_docs_${timestamp}`,
    scope: 'internal',
    metadata: {
      fileName: 'razorpay-docs-batch',
      fileType: 'text/markdown',
      lastModified: (latestModified ?? new Date(timestamp)).toISOString(),
      fileSize: totalFileSize,
      groupName: ['rzpay', 'docs'],
    },
  });
}
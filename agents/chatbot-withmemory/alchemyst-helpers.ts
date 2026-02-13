import 'dotenv/config';
import { streamText, StreamTextResult, ModelMessage, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import {openai} from '@ai-sdk/openai'
import AlchemystAI from '@alchemystai/sdk';
import { createRazorpayTools } from './tools';

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
  groupName?: string[];
  sourceLabel?: string;
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
  const hasHistory = history.length > 0;
  const memorySessionId = `rzpay_session_${Date.now()}`;
  const memoryGroupName = [`user-${userId}`, `session-${sessionId}`, 'chat-memory'];

  const defaultSystemPrompt = `You are a helpful Razorpay documentation assistant.
You provide accurate, concise answers about Razorpay's payment gateway, APIs, webhooks, payouts, refunds, and integrations.

Available tools:
1. search_context - Search documentation content
2. add_to_memory - Store conversation context
3. razorpay_navigation - Navigate users to specific documentation pages

Tool selection rules:
- Use search_context for factual/product questions about Razorpay docs.
- Use razorpay_navigation when user asks where to find docs, which section to open, or asks for links.

Search policy:
- Always search docs context with body_metadata: { "groupName": ["rzpay", "docs"] } before giving factual answers.
${hasHistory
  ? `- This conversation has history. Also search memory context with body_metadata: { "groupName": ${
      memoryGroupName} } and combine both results.`
  : '- If there is no history, docs context search is enough for retrieval.'}

When users ask about specific topics or want to read more:
- Use razorpay_navigation to find and provide direct links.
- Present the primary page link and mention alternatives if available.
- Guide users to the exact section they need.

Always provide helpful, accurate answers with proper navigation when needed.`;

  const messages: ModelMessage[] = [
    { role: 'system', content: systemPrompt || defaultSystemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const result = streamText({
    model: openai('gpt-5-chat-latest'),
    messages,
    tools: createRazorpayTools({ apiKey: alchemystApiKey }),
    toolChoice: 'auto',
    stopWhen: stepCountIs(5),
    onFinish: async ({ text }) => {
      const now = new Date().toISOString();
      try {
        await alchemyst.v1.context.memory.add({
          sessionId: memorySessionId,
          contents: [
            {
              content: userMessage,
              metadata: {
                source: 'chat',
                type: 'conversation',
                messageId: `user_${Date.now()}`,
                userId,
              } as any,
            },
            {
              content: text,
              metadata: {
                source: 'chat',
                type: 'conversation',
                messageId: `assistant_${Date.now()}`,
                userId,
              } as any,
            },
          ],
          metadata: {
            groupName: [`user-${userId}`, `session-${sessionId}`, 'chat-memory'],
            userId,
            source: 'chatbot-withmemory',
            timestamp: now,
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error saving conversation memory: ${message}`);
      }
    },
  });
  return result;
}

/**
 * Search through Razorpay docu  console.log(result);mentation context
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
export async function addRazorpayDocs({
  documents,
  groupName = ['rzpay', 'docs'],
  sourceLabel = 'razorpay-documentation',
}: AddRazorpayDocsParams): Promise<void> {
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
      groupName,
      source: doc.metadata?.source ?? sourceLabel,
      addedAt: doc.metadata?.addedAt ?? timestamp,
    },
  })) as any;

  await alchemyst.v1.context.add({
    documents: documentsWithMetadata,
    context_type: 'resource',
    source: `${sourceLabel}_${timestamp}`,
    scope: 'internal',
    metadata: {
      fileName: 'razorpay-docs-batch',
      fileType: 'text/markdown',
      lastModified: (latestModified ?? new Date(timestamp)).toISOString(),
      fileSize: totalFileSize,
      groupName,
    },
  });
}

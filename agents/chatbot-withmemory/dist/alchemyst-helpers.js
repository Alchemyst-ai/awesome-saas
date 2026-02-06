import 'dotenv/config';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { alchemystTools } from '@alchemystai/aisdk';
import AlchemystAI from '@alchemystai/sdk';
import { razorpayNavigationTool } from './navigation-tool';
const alchemystApiKey = process.env.ALCHEMYST_AI_API_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';
if (!alchemystApiKey || !geminiApiKey) {
    console.error('Missing env vars. Please set ALCHEMYST_AI_API_KEY and GEMINI_API_KEY.');
    process.exit(1);
}
const alchemyst = new AlchemystAI({ apiKey: alchemystApiKey });
/**
 * Generate text response for Razorpay documentation queries with memory
 */
export async function generateRazorpayResponse({ userId, sessionId, userMessage, systemPrompt }) {
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
    const messages = [
        {
            role: 'system',
            content: systemPrompt || defaultSystemPrompt,
        },
        {
            role: 'user',
            content: userMessage,
        },
    ];
    const result = streamText({
        model: google('gemini-2.0-flash-exp'),
        messages: messages,
        tools: {
            ...alchemystTools({ apiKey: alchemystApiKey }), // Context + Memory
            razorpay_navigation: razorpayNavigationTool, // Custom navigation tool
        },
        toolChoice: 'auto',
        onStepFinish: async ({ toolCalls }) => {
            if (toolCalls && toolCalls.length > 0) {
                // Enrich Alchemyst tool calls with metadata
                for (const toolCall of toolCalls) {
                    if (toolCall.toolName === 'context_search') {
                        toolCall.args = {
                            ...toolCall.args,
                            metadata: {
                                groupName: ['rzpay', 'docs'],
                            },
                        };
                    }
                    if (toolCall.toolName === 'memory_add') {
                        toolCall.args = {
                            ...toolCall.args,
                            sessionId: `rzpay_session_${sessionId}`,
                            metadata: {
                                groupName: [userId, 'chat', 'rzpay'],
                                userId,
                                sessionId: `rzpay_session_${sessionId}`,
                                timestamp: new Date().toISOString(),
                            },
                        };
                    }
                }
            }
        },
    });
    return result;
}
/**
 * Search through Razorpay documentation context
 */
export async function searchRazorpayDocs({ query, similarityThreshold = 0.8, limit = 5 }) {
    try {
        const response = await alchemyst.v1.context.search({
            query,
            similarity_threshold: similarityThreshold,
            minimum_similarity_threshold: 0.5,
            scope: 'internal'
        });
        const contexts = response.contexts || [];
        const razorpayDocs = contexts
            .filter((ctx) => {
            const groupName = ctx.metadata?.groupName || [];
            return groupName.includes('rzpay') && groupName.includes('docs');
        })
            .slice(0, limit)
            .map((ctx) => ({
            content: ctx.content,
            metadata: ctx.metadata
        }));
        return razorpayDocs;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error searching Razorpay docs: ${message}`);
        return [];
    }
}
/**
 * Add Razorpay documentation to context (for seeding)
 */
export async function addRazorpayDocs({ documents }) {
    const timestamp = new Date().toISOString();
    const documentsWithMetadata = documents.map(doc => ({
        content: doc.content,
        metadata: {
            ...doc.metadata,
            groupName: ['rzpay', 'docs'],
            source: 'razorpay-documentation',
            addedAt: timestamp,
        },
    }));
    await alchemyst.v1.context.add({
        documents: documentsWithMetadata,
        context_type: 'resource',
        source: `rzpay_docs_${timestamp}`,
        scope: 'internal',
        metadata: {
            groupName: ['rzpay', 'docs'],
        },
    });
}
//# sourceMappingURL=alchemyst-helpers.js.map
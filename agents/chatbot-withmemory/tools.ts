import AlchemystAI from '@alchemystai/sdk';
import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { razorpayNavigationTool } from './navigation-tool';

const toolParamSchemas = {
  add_to_context: z.object({
    documents: z
      .array(
        z
          .object({
            content: z.string().min(1).describe('Document content (required)'),
          })
          .and(z.record(z.string(), z.any())),
      )
      .min(1)
      .describe('Documents to add to context (at least 1 required)'),
    source: z.string().min(1).describe('Source identifier for the documents (required)'),
    context_type: z
      .enum(['resource', 'conversation', 'instruction'])
      .describe(
        'Type of context: resource (reference docs), conversation (chat history), or instruction (guidelines)',
      ),
    scope: z
      .enum(['internal', 'external'])
      .default('internal')
      .describe('Scope: internal (private) or external (shared)'),
    metadata: z
      .object({
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        lastModified: z.string().optional(),
        fileSize: z.number().optional(),
        groupName: z.array(z.string()).optional(),
      })
      .optional()
      .describe('Optional metadata for the context'),
  }),
  add_to_memory: z.object({
    sessionId: z.string().describe('The memory session ID that groups related memories together'),
    contents: z
      .array(
        z
          .object({
            content: z.string().min(1).describe('The content to store in memory (required)'),
            metadata: z
              .object({
                source: z.string().min(1).describe('Source of the content (required)'),
                messageId: z.string().min(1).describe('Message identifier (required)'),
                type: z.string().min(1).describe('Type of content (required)'),
              })
              .passthrough(),
          })
          .passthrough(),
      )
      .min(1)
      .describe('Array of content items to add to memory (at least 1 required)'),
  }),
  delete_memory: z.object({
    memoryId: z.string().describe('The memory ID to delete'),
    user_id: z.string().optional().describe('Optional user ID filter'),
    organization_id: z.string().optional().describe('Optional organization ID filter'),
  }),
  search_context: z
    .object({
      query: z.string().min(1, 'Query is required.').describe('Search query string'),
      similarity_threshold: z
        .number()
        .min(0)
        .max(1)
        .default(0.7)
        .describe('Maximum similarity threshold (0-1, default: 0.7)'),
      minimum_similarity_threshold: z
        .number()
        .min(0)
        .max(1)
        .default(0.5)
        .describe('Minimum similarity threshold (0-1, default: 0.5)'),
      scope: z
        .enum(['internal', 'external'])
        .default('internal')
        .describe('Search scope: internal or external'),
      body_metadata: z.record(z.string(), z.any()).optional().describe('Optional metadata filters'),
    })
    .refine((data) => data.minimum_similarity_threshold <= data.similarity_threshold, {
      message: 'minimum_similarity_threshold must be <= similarity_threshold.',
      path: ['minimum_similarity_threshold'],
    }),
  delete_context: z.object({
    source: z.string().describe('Source identifier to delete'),
    user_id: z.string().optional().describe('Optional user ID filter'),
    organization_id: z.string().optional().describe('Optional organization ID filter'),
    by_doc: z.boolean().optional().default(true).describe('Delete by document (default: true)'),
    by_id: z.boolean().optional().default(false).describe('Delete by ID (default: false)'),
  }),
};

type AddToContextResult = { success: true; message: string } | { success: false; message: string };
type SearchContextResult =
  | { success: true; message: string; data: any[] }
  | { success: false; message: string };
type DeleteContextResult = { success: true; message: string } | { success: false; message: string };
type AddToMemoryResult = { success: true; message: string } | { success: false; message: string };
type DeleteMemoryResult = { success: true; message: string } | { success: false; message: string };

export type ContextTools = {
  add_to_context: Tool<z.infer<typeof toolParamSchemas.add_to_context>, AddToContextResult>;
  search_context: Tool<z.infer<typeof toolParamSchemas.search_context>, SearchContextResult>;
  delete_context: Tool<z.infer<typeof toolParamSchemas.delete_context>, DeleteContextResult>;
};

export type MemoryTools = {
  add_to_memory: Tool<z.infer<typeof toolParamSchemas.add_to_memory>, AddToMemoryResult>;
  delete_memory: Tool<z.infer<typeof toolParamSchemas.delete_memory>, DeleteMemoryResult>;
};

type AlchemystToolsOptions = {
  apiKey?: string;
  withContext?: boolean;
  withMemory?: boolean;
};

export function createAlchemystTools({
  apiKey = process.env.ALCHEMYST_API_KEY,
  withContext = true,
  withMemory = false,
}: AlchemystToolsOptions = {}): Partial<ContextTools & MemoryTools> {
  if (typeof apiKey === 'string' && apiKey.trim() === '') {
    throw new Error('apiKey must be a non-empty string');
  }

  if (!apiKey) {
    throw new Error(
      'ALCHEMYST_API_KEY is required. Please provide it via the apiKey parameter or set the ALCHEMYST_API_KEY environment variable.',
    );
  }

  const client = new AlchemystAI({ apiKey });

  const contextTools: ContextTools = {
    add_to_context: tool({
      description:
        'Add context documents to Alchemyst AI. Use this to provide the AI with additional knowledge, documentation, or reference materials.',
      inputSchema: toolParamSchemas.add_to_context,
      execute: async (params): Promise<AddToContextResult> => {
        const { documents, source, context_type, scope, metadata } = params;
        try {
          const timestamp = new Date().toISOString();
          const contentSize = JSON.stringify(documents).length;

          await client.v1.context.add({
            documents,
            source,
            context_type,
            scope,
            metadata: {
              ...metadata,
              fileName: metadata?.fileName ?? `file_${Date.now()}`,
              fileSize: metadata?.fileSize ?? contentSize,
              fileType: metadata?.fileType ?? 'text/plain',
              lastModified: metadata?.lastModified ?? timestamp,
            },
          });
          return {
            success: true,
            message: `Successfully added ${documents.length} document(s) to context from source: ${source}`,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    }),
    search_context: tool({
      description:
        'Search stored context documents in Alchemyst AI. Use this to retrieve relevant information based on a query.',
      inputSchema: toolParamSchemas.search_context,
      execute: async (params): Promise<SearchContextResult> => {
        const { query, similarity_threshold, minimum_similarity_threshold, scope, body_metadata } =
          params;
        try {
          const response = await client.v1.context.search({
            query,
            similarity_threshold,
            minimum_similarity_threshold,
            scope,
            body_metadata,
          });

          const contexts = response?.contexts ?? [];
          return {
            success: true,
            message: `Found ${contexts.length} matching context(s)`,
            data: contexts,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    }),
    delete_context: tool({
      description:
        'Delete context data from Alchemyst AI. Use this to remove outdated or unwanted context documents.',
      inputSchema: toolParamSchemas.delete_context,
      execute: async (params): Promise<DeleteContextResult> => {
        const { source, user_id, organization_id, by_doc, by_id } = params;
        try {
          await client.v1.context.delete({
            source,
            user_id: user_id ?? undefined,
            organization_id: organization_id ?? '',
            by_doc: by_doc ?? true,
            by_id: by_id ?? false,
          });
          return {
            success: true,
            message: `Successfully deleted context from source: ${source}`,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    }),
  };

  const memoryTools: MemoryTools = {
    add_to_memory: tool({
      description:
        'Add memory context data to Alchemyst AI. Use this to store conversation history, user preferences, or important context that should be remembered across sessions.',
      inputSchema: toolParamSchemas.add_to_memory,
      execute: async (params): Promise<AddToMemoryResult> => {
        const { sessionId, contents } = params;
        try {
          await client.v1.context.memory.add({
            sessionId,
            contents: contents.map((item) => ({
              content: item.content,
              metadata: item.metadata,
            })),
          });
          return {
            success: true,
            message: `Successfully added ${contents.length} item(s) to memory with session ID: ${sessionId}`,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    }),
    delete_memory: tool({
      description: 'Delete memory context data from Alchemyst AI. Use this to remove stale memories.',
      inputSchema: toolParamSchemas.delete_memory,
      execute: async (params): Promise<DeleteMemoryResult> => {
        const { memoryId, user_id, organization_id } = params;
        try {
          await client.v1.context.memory.delete({
            memoryId,
            user_id: user_id ?? undefined,
            organization_id: organization_id ?? null,
          });
          return {
            success: true,
            message: `Successfully deleted memory with ID: ${memoryId}`,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    }),
  };

  return {
    ...(withContext ? contextTools : {}),
    ...(withMemory ? memoryTools : {}),
  };
}

type RazorpayToolsOptions = {
  apiKey?: string;
};

export function createRazorpayTools({ apiKey }: RazorpayToolsOptions = {}) {
  return {
    ...createAlchemystTools({ apiKey, withContext: true, withMemory: true }),
    razorpay_navigation: razorpayNavigationTool,
  };
}

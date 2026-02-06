import 'dotenv/config';
import { StreamTextResult } from 'ai';
interface GenerateRazorpayResponseParams {
    userId: string;
    sessionId: string;
    userMessage: string;
    systemPrompt?: string;
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
export declare function generateRazorpayResponse({ userId, sessionId, userMessage, systemPrompt }: GenerateRazorpayResponseParams): Promise<StreamTextResult<any, any>>;
/**
 * Search through Razorpay documentation context
 */
export declare function searchRazorpayDocs({ query, similarityThreshold, limit }: SearchRazorpayDocsParams): Promise<ContextResult[]>;
/**
 * Add Razorpay documentation to context (for seeding)
 */
export declare function addRazorpayDocs({ documents }: AddRazorpayDocsParams): Promise<void>;
export {};
//# sourceMappingURL=alchemyst-helpers.d.ts.map
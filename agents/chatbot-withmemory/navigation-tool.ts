import { tool } from 'ai';
import { z } from 'zod';
import { searchNavigation, NavigationEntry } from './sitemap-parser';

const defaultDocsOrigin = 'https://razorpay.com/docs';

const normalizeOrigin = (origin: string): string => origin.replace(/\/+$/, '');

const slugify = (query: string): string =>
  query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const buildDocsUrl = (query: string): string => {
  const origin = normalizeOrigin(defaultDocsOrigin);
  const slug = slugify(query);
  return `${origin}/${slug}`;
};


interface NavigationLink {
  title: string;
  url: string;
  section: string;
}

interface NavigationResult {
  type: 'navigation' | 'no_results' | 'sections' | 'error';
  primary?: NavigationLink;
  alternates?: NavigationLink[];
  sections?: string[];
  suggestions?: NavigationLink[];
  message: string;
}


/**
 * Custom tool for navigating Razorpay documentation
 */
export const razorpayNavigationTool = tool({
  description: `Generate and navigate Razorpay documentation pages. Use this tool when user wants to:
- Find specific documentation pages
- Navigate to a particular section (payments, refunds, webhooks, etc.)
- Get direct links to documentation
Returns the most relevant documentation URLs based on the query.`,
  
  inputSchema: z.object({
    query: z.string().describe('The topic or page the user wants to navigate to (e.g., "payment links", "webhooks", "refunds")'),
    intent: z.enum(['navigate', 'search', 'list']).optional().describe('User intent: navigate to specific page, search docs, or list available sections'),
  }),
  
  execute: async ({ query }): Promise<NavigationResult> => {
    try {
      const url = buildDocsUrl(query);

      return {
        type: 'navigation',
        primary: {
          title: query,
          url,
          section: query.split(' ')[0] ?? query,
        },
        message: `Navigate to ${url}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        type: 'error',
        message: `Error generating documentation link: ${message}`,
      };
    }
  },
});
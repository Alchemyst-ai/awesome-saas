import { tool } from 'ai';
import { z } from 'zod';
import { getNavigation, searchNavigation } from './sitemap-parser';
/**
 * Custom tool for navigating Razorpay documentation
 */
export const razorpayNavigationTool = tool({
    description: `Search and navigate Razorpay documentation pages. Use this tool when user wants to:
- Find specific documentation pages
- Navigate to a particular section (payments, refunds, webhooks, etc.)
- Get direct links to documentation
Returns the most relevant documentation URLs based on the query.`,
    inputSchema: z.object({
        query: z.string().describe('The topic or page the user wants to navigate to (e.g., "payment links", "webhooks", "refunds")'),
        intent: z.enum(['navigate', 'search', 'list']).optional().describe('User intent: navigate to specific page, search docs, or list available sections'),
    }),
    execute: async ({ query, intent = 'navigate' }) => {
        try {
            const navigation = await getNavigation();
            if (intent === 'list') {
                // Return unique sections
                const sections = [...new Set(navigation.map(n => n.section))];
                return {
                    type: 'sections',
                    sections,
                    message: `Available documentation sections: ${sections.join(', ')}`,
                };
            }
            const results = searchNavigation(navigation, query);
            if (results.length === 0) {
                return {
                    type: 'no_results',
                    message: `No documentation pages found for "${query}". Try searching for: payments, refunds, webhooks, subscriptions, or payouts.`,
                    suggestions: navigation.slice(0, 3).map(n => ({
                        title: n.title,
                        url: n.url,
                        section: n.section
                    })),
                };
            }
            const topResult = results[0];
            return {
                type: 'navigation',
                primary: {
                    title: topResult.title,
                    url: topResult.url,
                    section: topResult.section,
                },
                alternates: results.slice(1, 4).map(r => ({
                    title: r.title,
                    url: r.url,
                    section: r.section,
                })),
                message: `Found documentation for "${query}". Navigate to: ${topResult.title} (${topResult.url})`,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                type: 'error',
                message: `Error searching documentation: ${message}`,
            };
        }
    },
});
//# sourceMappingURL=navigation-tool.js.map
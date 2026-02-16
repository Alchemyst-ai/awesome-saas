import { tool } from 'ai';
import { z } from 'zod';

const defaultDocsOrigin = 'https://razorpay.com/docs';

interface SectionCandidate {
  id: string;
  section: string;
  title: string;
  path: string;
  keywords: string[];
}

const SECTION_CANDIDATES: SectionCandidate[] = [
  {
    id: 'payments',
    section: 'payments',
    title: 'Payments APIs',
    path: '/payments',
    keywords: [
      'payment',
      'payments',
      'capture',
      'authorize',
      'authorized',
      'settle',
      'settlement',
      'upi',
      'card',
      'netbanking',
      'wallet',
    ],
  },
  {
    id: 'orders',
    section: 'orders',
    title: 'Orders APIs',
    path: '/orders',
    keywords: [
      'order',
      'orders',
      'create order',
      'fetch order',
      'update order',
      'order id',
      'receipt',
      'amount due',
      'attempts',
    ],
  },
  {
    id: 'orders-create',
    section: 'orders create',
    title: 'Orders Create',
    path: '/orders',
    keywords: [
      'create order',
      'new order',
      'order create',
      'receipt',
      'partial payment',
      'first payment min amount',
    ],
  },
  {
    id: 'orders-fetch-all',
    section: 'orders fetch all',
    title: 'Orders Fetch All',
    path: '/orders',
    keywords: [
      'fetch all orders',
      'list orders',
      'all orders',
      'orders list',
      'from',
      'to',
      'count',
      'skip',
    ],
  },
  {
    id: 'orders-update',
    section: 'orders update',
    title: 'Orders Update',
    path: '/orders',
    keywords: [
      'update order',
      'edit order',
      'order notes',
      'notes update',
      'patch order',
    ],
  },
  {
    id: 'understand',
    section: 'understand',
    title: 'Understand Razorpay APIs',
    path: '/api',
    keywords: [
      'api',
      'apis',
      'overview',
      'authentication',
      'auth',
      'status code',
      'error',
      'errors',
      'pagination',
      'rest',
      'basic',
      'docs',
    ],
  },
  {
    id: 'payments-capture',
    section: 'payments capture',
    title: 'Payments Capture',
    path: '/payments',
    keywords: [
      'capture payment',
      'payment capture',
      'authorized payment',
      'auto capture',
      'manual capture',
    ],
  },
  {
    id: 'payments-fetch-all',
    section: 'payments fetch all',
    title: 'Payments Fetch All',
    path: '/payments',
    keywords: [
      'fetch all payments',
      'list payments',
      'all payments',
      'payment list',
      'expand',
    ],
  },
  {
    id: 'payments-fetch-all-expanded-card',
    section: 'payments expanded card',
    title: 'Payments Fetch All Expanded Card',
    path: '/payments',
    keywords: [
      'expanded card',
      'card details',
      'card expanded',
      'emi',
      'network',
      'issuer',
      'last4',
    ],
  },
  {
    id: 'payments-fetch-with-id',
    section: 'payments fetch with id',
    title: 'Payments Fetch With ID',
    path: '/payments',
    keywords: [
      'fetch payment by id',
      'payment id',
      'single payment',
      'get payment',
      'payment details',
    ],
  },
  {
    id: 'payments-update',
    section: 'payments update',
    title: 'Payments Update',
    path: '/payments',
    keywords: [
      'update payment',
      'edit payment',
      'payment notes',
      'notes in payment',
      'patch payment',
    ],
  },
  {
    id: 'refunds-create-normal',
    section: 'refunds create',
    title: 'Refunds Create',
    path: '/refunds',
    keywords: [
      'create refund',
      'refund payment',
      'instant refund',
      'normal refund',
      'refund speed',
      'refund amount',
    ],
  },
  {
    id: 'refunds-fetch-all',
    section: 'refunds fetch all',
    title: 'Refunds Fetch All',
    path: '/refunds',
    keywords: [
      'fetch all refunds',
      'list refunds',
      'all refunds',
      'refund list',
      'refund status',
    ],
  },
  {
    id: 'refunds-update',
    section: 'refunds update',
    title: 'Refunds Update',
    path: '/refunds',
    keywords: [
      'update refund',
      'edit refund',
      'refund notes',
      'notes in refund',
      'patch refund',
    ],
  },
];

interface NavigationLink {
  title: string;
  url: string;
  section: string;
  sectionId: string;
}

interface NavigationResult {
  type: 'navigation' | 'no_results' | 'sections' | 'error';
  primary?: NavigationLink;
  alternates?: NavigationLink[];
  sections?: string[];
  suggestions?: NavigationLink[];
  message: string;
}

const normalizeOrigin = (origin: string): string => origin.replace(/\/+$/, '');

const buildSectionUrl = (candidate: SectionCandidate): string =>
  `${normalizeOrigin(defaultDocsOrigin)}${candidate.path}`;

function scoreCandidate(query: string, candidate: SectionCandidate): number {
  const lower = query.toLowerCase();
  let score = 0;

  if (lower.includes(candidate.section)) score += 4;
  if (lower.includes(candidate.title.toLowerCase())) score += 5;

  for (const keyword of candidate.keywords) {
    if (lower.includes(keyword)) {
      score += keyword.includes(' ') ? 3 : 2;
    }
  }

  return score;
}

function asNavigationLink(candidate: SectionCandidate): NavigationLink {
  return {
    title: candidate.title,
    url: buildSectionUrl(candidate),
    section: candidate.section,
    sectionId: candidate.id,
  };
}

export function resolveRazorpayNavigation(
  query: string,
  intent: 'navigate' | 'search' | 'list' = 'navigate',
): NavigationResult {
  const normalizedQuery = query.trim();

  if (intent === 'list') {
    return {
      type: 'sections',
      sections: SECTION_CANDIDATES.map((entry) => entry.title),
      message: `Available sections: ${SECTION_CANDIDATES.map((entry) => entry.title).join(', ')}`,
    };
  }

  if (!normalizedQuery) {
    return {
      type: 'no_results',
      message: 'Please provide a topic so I can route you to the right section.',
      suggestions: SECTION_CANDIDATES.map(asNavigationLink),
    };
  }

  const ranked = SECTION_CANDIDATES.map((candidate) => ({
    candidate,
    score: scoreCandidate(normalizedQuery, candidate),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return {
      type: 'no_results',
      message: `No direct section match found for "${normalizedQuery}".`,
      suggestions: SECTION_CANDIDATES.map(asNavigationLink),
    };
  }

  const [top, ...rest] = ranked;

  return {
    type: 'navigation',
    primary: asNavigationLink(top.candidate),
    alternates: rest.slice(0, 2).map((entry) => asNavigationLink(entry.candidate)),
    message: `Route user to "${top.candidate.title}".`,
  };
}

/**
 * Custom tool for navigating Razorpay documentation
 */
export const razorpayNavigationTool = tool({
  description: `Navigate users to the most relevant Razorpay documentation section.
Use when the user asks where to find a topic (payments, orders, API basics, etc.).`,

  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'User topic to route, e.g. "capture payment", "create order", "API authentication"',
      ),
    intent: z
      .enum(['navigate', 'search', 'list'])
      .optional()
      .describe('Optional navigation intent'),
  }),

  execute: async ({ query, intent = 'navigate' }): Promise<NavigationResult> => {
    try {
      return resolveRazorpayNavigation(query, intent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        type: 'error',
        message: `Navigation failed: ${message}`,
      };
    }
  },
});

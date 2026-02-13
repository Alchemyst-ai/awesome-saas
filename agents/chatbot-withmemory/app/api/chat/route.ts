import { NextResponse } from 'next/server';
import { generateRazorpayResponse, searchRazorpayDocs } from '../../../alchemyst-helpers';
import { ModelMessage } from 'ai';
import { resolveRazorpayNavigation } from '../../../navigation-tool';

const defaultSessionId = process.env.SESSION_ID || `msg_${Date.now()}`;
const defaultUserId = process.env.USER_ID || 'demo-user';


// Simple in-memory history store (Note: In a real serverless env, use Redis/DB)
const historyStore = new Map<string, ModelMessage[]>();

const getHistory = (sessionId: string): ModelMessage[] => {
  if (historyStore.has(sessionId)) {
    return historyStore.get(sessionId)!;
  }
  const next: ModelMessage[] = [];
  historyStore.set(sessionId, next);
  return next;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, sessionId = defaultSessionId, userId = defaultUserId } = body;

    console.log(sessionId, userId);

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const trimmedInput = input.trim();
    const history = getHistory(sessionId);

    // 1. Handle Commands
    if (trimmedInput.toLowerCase() === '/help') {
      return NextResponse.json({
        text: 'Ask about Razorpay payments, refunds, webhooks, subscriptions, or use /search <query>.',
      });
    }

    // 2. Handle Explicit Search
    if (trimmedInput.toLowerCase().startsWith('/search ')) {
      const query = trimmedInput.slice(8).trim();
      const results = await searchRazorpayDocs({ query });
      return NextResponse.json({
        results: results.map((result) => ({
          content: result.content || '',
          metadata: result.metadata || null,
        })),
      });
    }

    // 3. Handle Regular Chat
    const result = await generateRazorpayResponse({
      userId,
      sessionId,
      userMessage: trimmedInput,
      history,
    });

    // Note: This gets the full text. For scrolling/streaming UI, you might want to use Vercel AI SDK's useChat
    // But aligning with your requested architecture (simple HTTP call), we await the result.
    const text = (await result.text) || '';
    const navigationQuery = trimmedInput.replace(/^\[section:[^\]]+\]\s*/i, '');
    const navigation = resolveRazorpayNavigation(navigationQuery, 'navigate');
    const sectionId =
      navigation.type === 'navigation' ? navigation.primary?.sectionId ?? null : null;
    
    console.log(text);
    if (text.trim()) {
      history.push({ role: 'user', content: trimmedInput });
      history.push({ role: 'assistant', content: text });
    }

    return NextResponse.json({ text, sectionId });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

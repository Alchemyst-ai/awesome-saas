import 'dotenv/config';
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { generateRazorpayResponse, searchRazorpayDocs } from './alchemyst-helpers';
import { ModelMessage } from 'ai';

const defaultSessionId = process.env.SESSION_ID || `${Date.now()}`;
const defaultUserId = process.env.USER_ID || 'demo-user';
const port = Number(process.env.PORT || 3000);

const historyStore = new Map<string, ModelMessage[]>();

const getHistory = (sessionId: string): ModelMessage[] => {
  const history = historyStore.get(sessionId);
  if (history) return history;
  const next: ModelMessage[] = [];
  historyStore.set(sessionId, next);
  return next;
};

const readJsonBody = async (req: import('node:http').IncomingMessage): Promise<any> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) return null;

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
};

const writeJson = (
  res: import('node:http').ServerResponse,
  status: number,
  payload: unknown
): void => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const writeText = (
  res: import('node:http').ServerResponse,
  status: number,
  text: string
): void => {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    writeJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/chat') {
    try {
      const body = await readJsonBody(req);
      const input = body?.input;
      const sessionId = String(body?.sessionId || defaultSessionId);
      const userId = String(body?.userId || defaultUserId);

      if (typeof input !== 'string' || !input.trim()) {
        writeJson(res, 400, { error: 'input is required' });
        return;
      }

      const trimmedInput = input.trim();
      const history = getHistory(sessionId);

      if (trimmedInput.toLowerCase() === '/help') {
        writeJson(res, 200, {
          text:
            'Ask about Razorpay payments, refunds, webhooks, subscriptions, or use /search <query>.',
        });
        return;
      }

      if (trimmedInput.toLowerCase().startsWith('/search ')) {
        const query = trimmedInput.slice(8).trim();
        const results = await searchRazorpayDocs({ query });
        writeJson(res, 200, {
          results: results.map((result) => ({
            content: result.content || '',
            metadata: result.metadata || null,
          })),
        });
        return;
      }

      if (['/exit', '/quit', '/bye'].includes(trimmedInput.toLowerCase())) {
        writeJson(res, 200, { text: 'Goodbye.' });
        return;
      }

      const result = await generateRazorpayResponse({
        userId,
        sessionId,
        userMessage: trimmedInput,
        history,
      });

      const text = (await result.text) || '';

      if (text.trim()) {
        history.push({ role: 'user', content: trimmedInput });
        history.push({ role: 'assistant', content: text });
      }

      writeJson(res, 200, { text });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      writeJson(res, 500, { error: message });
    }

    return;
  }

  writeText(res, 404, 'Not found');
});

server.listen(port, () => {
  console.log(`Chat API listening on http://localhost:${port}`);
});

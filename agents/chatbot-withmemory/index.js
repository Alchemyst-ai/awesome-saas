import 'dotenv/config';
import * as readline from 'readline';
import crypto from 'crypto';
import AlchemystAI from '@alchemystai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const alchemystApiKey = process.env.ALCHEMYST_AI_API_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

if (!alchemystApiKey || !geminiApiKey) {
  console.error('Missing env vars. Please set ALCHEMYST_AI_API_KEY and GEMINI_API_KEY.');
  process.exit(1);
}

const alchemyst = new AlchemystAI({ apiKey: alchemystApiKey });
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const sessionId = process.env.SESSION_ID || `session-${Date.now()}`;
const userId = process.env.USER_ID || 'demo-user';
const botId = 'razorpay-assistant';

const askQuestion = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const addMemory = async ({ role, content }) => {
  const timestamp = new Date().toISOString();
  await alchemyst.v1.context.add({
    documents: [{ content }],
    context_type: 'resource',
    source: `chatbot-${sessionId}-${role}-${timestamp}`,
    scope: 'internal',
    metadata: {
      sessionId,
      role,
      userId,
      botId,
      fileName: `chatbot-${sessionId}-${role}-${timestamp}.txt`,
      fileType: 'text/plain',
      lastModified: timestamp,
      fileSize: content.length,
    },
  });
};

const buildPrompt = ({ question, contexts }) => {
  const formattedContexts = (contexts || [])
    .map((c, index) => {
      const content = c.content || JSON.stringify(c);
      return `Context ${index + 1}: ${content}`;
    })
    .join('\n\n');

  const contextBlock = formattedContexts
    ? `\nRELEVANT MEMORY / CONTEXT:\n${formattedContexts}\n`
    : '\nNo relevant memory found. Answer using general knowledge and best practices.\n';

  return (
    `You are a helpful, concise Razorpay support chatbot for a product demo.\n` +
    `You can answer questions about onboarding, payments, refunds, subscriptions, webhooks, and dashboard usage.\n` +
    `If the question requires account-specific data or private info, ask a clarifying question and explain that you cannot access real account data.\n` +
    `If the provided memory is insufficient, say so and answer with general guidance.\n` +
    `${contextBlock}\n` +
    `User question: ${question}`
  );
};

async function runChat() {
  console.log('Razorpay Demo Chatbot (Alchemyst AI + Gemini)');
  console.log('Type your question. Commands: /exit, /seed, /help\n');

  while (true) {
    const input = (await askQuestion('You: ')).trim();

    if (!input) {
      console.log('Please enter a question.');
      continue;
    }

    if (['/exit', '/quit', '/bye'].includes(input.toLowerCase())) {
      console.log('Goodbye.');
      break;
    }

    if (input.toLowerCase() === '/help') {
      console.log('Try asking about payouts, refunds, webhooks, or subscriptions.');
      continue;
    }

    if (input.toLowerCase() === '/seed') {
      console.log('Run: npm run seed (from agents/chatbot-withmemory)');
      continue;
    }

    try {
      await addMemory({ role: 'user', content: input });

      const { contexts } = await alchemyst.v1.context.search({
        query: input,
        similarity_threshold: 0.8,
        minimum_similarity_threshold: 0.5,
        scope: 'internal',
        metadata: null,
      });

      const prompt = buildPrompt({ question: input, contexts });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log(`Bot: ${responseText}\n`);

      await addMemory({ role: 'assistant', content: responseText });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error: ${message}`);
      console.log('Please try again.\n');
    }
  }

  rl.close();
}

runChat();

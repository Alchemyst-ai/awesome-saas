import 'dotenv/config';
import * as readline from 'readline';
import { generateRazorpayResponse, searchRazorpayDocs } from './alchemyst-helpers';
import { ModelMessage } from 'ai';
import * as util from 'node:util';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sessionId = process.env.SESSION_ID || `${Date.now()}`;
const userId = process.env.USER_ID || 'demo-user';

const askQuestion = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

const history: ModelMessage[] = [];

async function runChat(): Promise<void> {
  console.log('Razorpay Documentation Agent (Alchemyst AI + Gemini)');
  console.log('Type your question. Commands: /exit, /search <query>, /help\n');

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
      console.log('Ask about Razorpay payments, refunds, webhooks, subscriptions, or use /search <query>');
      console.log('I can also navigate you to specific documentation pages!');
      continue;
    }

    if (input.toLowerCase().startsWith('/search ')) {
      const query = input.slice(8).trim();
      const results = await searchRazorpayDocs({ query });
      console.log(`\nFound ${results.length} results:`);
      results.forEach((ctx, idx) => {
        console.log(`\n${idx + 1}. ${ctx.content?.substring(0, 200)}...`);
      });
      console.log();
      continue;
    }

    try {
      const result = await generateRazorpayResponse({
        userId,
        sessionId,
        userMessage: input,
        history,
      });

      process.stdout.write('Bot: ');
      console.log("Result streaming ");
      const res = result;
      for await (const chunk of res.textStream) {
        process.stdout.write(chunk);
      }

      const final = await result.text;
      if (final?.trim()) process.stdout.write(final);
      
      console.log('\n');

      const response = await result.response;
      console.log('raw response:');
      console.log(
        util.inspect(response, {
          depth: null,
          colors: true,
          maxArrayLength: null,
        })
      );

      console.log('[debug] finishReason:', await result.finishReason);
      console.log('[debug] text:', await result.text);

      const toolCalls =
        response.messages?.flatMap((msg: any) => msg.toolCalls || []) ??
        [];
      console.log('[debug] toolCalls:', util.inspect(toolCalls, { depth: null }));

      // Show navigation links if any
      if (process.env.DEBUG_AGENT === 'true') {
        console.log(`[debug] response-id=${response.id} model=${response.modelId}`);
      }
      const finalText = await result.text;
      if (final?.trim()) {
        history.push({ role: 'user', content: input });
        history.push({ role: 'assistant', content: final });
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error: ${message}`);
      console.log('Please try again.\n');
    }
  }

  rl.close();
}

runChat();

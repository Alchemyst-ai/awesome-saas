import 'dotenv/config';
import * as readline from 'readline';
import { generateRazorpayResponse, searchRazorpayDocs } from './alchemyst-helpers';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const sessionId = process.env.SESSION_ID || `${Date.now()}`;
const userId = process.env.USER_ID || 'demo-user';
const askQuestion = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
async function runChat() {
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
            });
            // Stream the response
            process.stdout.write('Bot: ');
            for await (const chunk of result.textStream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
            // Show navigation links if any
            const response = await result.response;
            const toolCalls = response.messages?.flatMap((msg) => msg.toolCalls || []);
            const navCalls = toolCalls?.filter((tc) => tc.toolName === 'razorpay_navigation');
            if (navCalls && navCalls.length > 0) {
                console.log('\n📍 Navigation suggestions:');
                for (const call of navCalls) {
                    const navResult = call.result;
                    if (navResult?.type === 'navigation') {
                        console.log(`  → ${navResult.primary.title}: ${navResult.primary.url}`);
                        if (navResult.alternates && navResult.alternates.length > 0) {
                            console.log('  Alternatives:');
                            navResult.alternates.forEach((alt) => {
                                console.log(`    • ${alt.title}: ${alt.url}`);
                            });
                        }
                    }
                }
                console.log();
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error: ${message}`);
            console.log('Please try again.\n');
        }
    }
    rl.close();
}
runChat();
//# sourceMappingURL=index.js.map
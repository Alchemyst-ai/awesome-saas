import AlchemystAI from '@alchemystai/sdk';
import * as readline from 'readline';
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_AI_API_KEY || '',
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function runCLI() {
  console.log('🧪 Alchemyst AI CLI Tool');
  console.log('Type your questions and get AI-powered answers with context!');
  console.log('Type "exit", "quit", or "bye" to stop.\n');

  if (!process.env.ALCHEMYST_AI_API_KEY || !process.env.GEMINI_API_KEY) {
    console.error('Error: Both ALCHEMYST_AI_API_KEY and GEMINI_API_KEY environment variables are required.');
    process.exit(1);
  }

  while (true) {
    try {
      const userQuestion = await askQuestion('💭 Ask me anything: ');

      const exitCommands = ['exit', 'quit', 'bye', 'stop'];
      if (exitCommands.includes(userQuestion.toLowerCase().trim())) {
        console.log('👋 Goodbye! Thanks for using Alchemyst AI CLI!');
        break;
      }

      if (!userQuestion.trim()) {
        console.log('⚠️  Please enter a question.\n');
        continue;
      }

      console.log('🔍 Searching for relevant context...');

      const { contexts } = await client.v1.context.search({
        query: userQuestion,
        similarity_threshold: 0.8,
        minimum_similarity_threshold: 0.5,
        scope: 'internal',
        metadata: null,
      });

      let promptText = userQuestion;
      if (contexts && contexts.length > 0) {
        console.log('\n📚 Found relevant contexts:');
        const formattedContexts = contexts.map((c, index) => {
          const content = c.content || JSON.stringify(c);
          // console.log(`${index + 1}. ${content}`);
          return `Context ${index + 1}: ${content}`;
        }).join('\n\n');

        console.log('\n' + '─'.repeat(50) + '\n');
        promptText = `Based on the following context, please answer the question.
If the context is insufficient, state that you cannot answer based on the provided information and use your general knowledge.

Contexts:
${formattedContexts}

Question: ${userQuestion}`;

      } else {
        console.log('\n⚠️  No relevant contexts found for your question.');
        console.log('The AI will answer based on general knowledge.\n');
        console.log('─'.repeat(50) + '\n');
      }

      console.log('🧠 Generating a response...');
      const result = await model.generateContent(promptText);
      const geminiResponse = result.response;
      const responseText = geminiResponse.text();
      console.log(responseText);
      console.log('\n' + '─'.repeat(50) + '\n');

    } catch (error) {
      console.error('Error occurred:', error instanceof Error ? `${error.message}` : 'Unknown error');
      console.log('Please try again.\n');
    }
  }

  rl.close();
}

runCLI();
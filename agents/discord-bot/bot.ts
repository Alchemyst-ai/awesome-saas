import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import AlchemystAI from "@alchemystai/sdk";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DISCORD_BOT_TOKEN || !ALCHEMYST_AI_API_KEY || !OPENAI_API_KEY) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const discord = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent, 
  ],
  partials: [Partials.Channel],
});

const alchemyst = new AlchemystAI({ apiKey: ALCHEMYST_AI_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

discord.on("clientReady", () => {
  console.log(`✅ Logged in as ${discord.user?.tag}`);
});

discord.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (message.guild) return;

  console.log(`\n💬 New message from ${message.author.tag}: ${message.content}`);

  try {
    const userId = message.author.id;
    const userMessage = message.content;
    const timestamp = new Date().toISOString();
    const response:any = await alchemyst.v1.context.add({
      documents: [
            {
              content: userMessage,
            },
          ],
          context_type: 'resource',
          source: `discord${userId}${timestamp}`,
          scope: 'internal',
          metadata: {
            fileName: `discord${userId}${timestamp}`,
            fileType: 'text/plain',
            lastModified: new Date().toISOString(),
            fileSize: 1024,
        }
    });

    const {contexts} = await alchemyst.v1.context.search({
      query: userMessage,
      similarity_threshold: 0.8,
      minimum_similarity_threshold: 0.5,
      scope: "internal",
      metadata: null,
    });

    let systemPrompt = userMessage;
    if (contexts && contexts.length > 0) {
      console.log("\n📚 Found relevant contexts:");
      const formattedContexts = contexts
        .map((c, index) => {
          const content = c.content || JSON.stringify(c);
          return `Context ${index + 1}: ${content}`;
        })
        .join("\n\n");
      console.log("\n" + "─".repeat(50) + "\n");
      systemPrompt = `You are a helpful Discord bot. Here is the conversation context and user id.
If the context is insufficient, state that you cannot answer based on the provided information and use your general knowledge.

Contexts:${formattedContexts}

User ID: ${userId}

Question: ${userMessage}`;
    } else {
      console.log("\n⚠️  No relevant contexts found for your question.");
      console.log("The bot will answer based on general knowledge.\n");
      console.log("─".repeat(50) + "\n");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content || "No response generated.";

    await message.reply(reply);
    console.log(`🤖 Replied to ${message.author.tag}: ${reply}`);
  } catch (error) {
    console.error("Error processing message:", error);
    await message.reply("⚠️ Oops, something went wrong.");
  }
});

discord.login(DISCORD_BOT_TOKEN);

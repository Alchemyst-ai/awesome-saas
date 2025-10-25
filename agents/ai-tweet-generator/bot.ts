import dotenv from "dotenv";
import readlineSync from "readline-sync";
import OpenAI from "openai";
import AlchemystAI from "@alchemystai/sdk";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!OPENAI_API_KEY || !ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing API key(s). Check your .env file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const alchemyst = new AlchemystAI({ apiKey: ALCHEMYST_AI_API_KEY });

// 🧠 Memory-enabled Tweet Generator
async function generateTweets(topic: string, tone: string) {
  console.log(`\n🧠 Using Alchemyst memory + OpenAI model...`);
  console.log(`📝 Topic: "${topic}" | Tone: "${tone}"\n`);

  await alchemyst.memory.store({
    namespace: "tweet-generator",
    data: { topic, tone, createdAt: new Date().toISOString() },
  });

  const prompt = `
You are a social media strategist.
Generate 5 short, catchy tweets about "${topic}" in a ${tone} tone.
Each tweet must be under 280 characters.

Format:
## Topic: ${topic}
## Tone: ${tone}
## Tweets:
1.
2.
3.
4.
5.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const tweets = response.choices[0]?.message?.content || "⚠️ No tweets generated.";
  console.log("\n🐦 Generated Tweets:\n", tweets);

  await alchemyst.memory.store({
    namespace: "tweet-generator",
    data: { topic, tone, tweets },
  });
}

async function viewHistory() {
  const past = await alchemyst.memory.retrieve({ namespace: "tweet-generator" });
  if (!past?.length) return console.log("📭 No previous tweet generations found.");

  console.log("\n📜 Previous Topics:\n");
  past.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.topic} (${p.tone})`));
}

(async () => {
  const action = readlineSync.question("\nChoose an action:\n1️⃣ Generate Tweets\n2️⃣ View History\n> ");

  if (action === "2") return await viewHistory();

  const topic = readlineSync.question("Enter the topic for your tweets: ");
  const tone = readlineSync.question("Enter the tone (e.g., Funny, Motivational, Informative): ");
  await generateTweets(topic, tone);
})();

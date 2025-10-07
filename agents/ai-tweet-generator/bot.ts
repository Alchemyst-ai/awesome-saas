import dotenv from "dotenv";
import readlineSync from "readline-sync";
import OpenAI from "openai";
import AlchemystAI from "@alchemystai/sdk";

dotenv.config();

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key.");
  process.exit(1);
}

if (!ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing Alchemyst AI API key.");
  process.exit(1);
}

// Initialize SDKs
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const alchemyst = new AlchemystAI({
  apiKey: ALCHEMYST_AI_API_KEY,
});

// Main function
async function generateTweets(topic: string, tone: string) {
  console.log(`\n🧠 Using memory layer + OpenAI model...`);
  console.log(`📝 Topic: "${topic}" | Tone: "${tone}"\n`);

  // Step 1️⃣ — Store the topic & tone context in Alchemyst memory
  await alchemyst.memory.store({
    namespace: "tweet-generator",
    data: {
      topic,
      tone,
      timestamp: new Date().toISOString(),
    },
  });

  // Step 2️⃣ — Generate tweets with OpenAI
  const prompt = `
You are a social media expert.
Generate 5 creative, engaging, and concise tweets about the following topic.
Tone: ${tone}.
Each tweet should be under 280 characters.
Provide the output in this format:

## Topic: ${topic}
## Tone: ${tone}
## Tweets:
1.
2.
3.
4.
5.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const tweets = completion.choices[0]?.message?.content || "No tweets generated.";
    console.log("🐦 Generated Tweets:\n", tweets);

    // Step 3️⃣ — Store output in Alchemyst memory (for recall later)
    await alchemyst.memory.store({
      namespace: "tweet-generator",
      data: {
        topic,
        tone,
        tweets,
      },
    });

  } catch (error) {
    console.error("❌ Error generating tweets:", error);
  }
}

// Step 4️⃣ — Recall memory (optional)
async function showHistory() {
  const history = await alchemyst.memory.retrieve({
    namespace: "tweet-generator",
  });

  if (!history || history.length === 0) {
    console.log("🕳️ No past tweet generations found.");
    return;
  }

  console.log("\n🧾 Past Generations:\n");
  history.forEach((entry: any, index: number) => {
    console.log(`${index + 1}. Topic: ${entry.topic} | Tone: ${entry.tone}`);
  });
}

// CLI Menu
(async () => {
  const action = readlineSync.question(
    "\nChoose an action:\n1️⃣ Generate Tweets\n2️⃣ View History\n> "
  );

  if (action === "2") {
    await showHistory();
    process.exit(0);
  }

  const topic = readlineSync.question("Enter the topic for your tweets: ");
  const tone = readlineSync.question("Enter the tone (e.g., Informative, Funny, Motivational): ");

  await generateTweets(topic, tone);
})();

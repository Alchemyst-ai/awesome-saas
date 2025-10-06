import dotenv from "dotenv";
import readlineSync from "readline-sync";
import AlchemystAI from "@alchemystai/sdk";

dotenv.config();

// Load environment variables
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing Alchemyst AI API key.");
  process.exit(1);
}

// Initialize Alchemyst Agent
const alchemyst = new AlchemystAI({
  apiKey: ALCHEMYST_AI_API_KEY,
  agent: {
    name: "AI Tweet Generator",
    memory: true, // 🔥 Persistent memory layer enabled
    personality: "Creative and witty social media strategist",
  },
});

// Function to generate tweets
async function generateTweets(topic: string, tone: string) {
  console.log(`\n📝 Generating tweets for topic: "${topic}" with tone: "${tone}"\n`);

  const prompt = `
You are a social media expert.
Generate 5 creative, engaging, and concise tweets about the following topic.
Tone: ${tone}.
Each tweet should be under 280 characters.
Provide the output in a structured format:

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
    // 🧠 Use the Alchemyst AI agent for contextual memory-based reasoning
    const response = await alchemyst.respond(prompt, {
      memoryTags: ["tweets", topic, tone], // Used for contextual recall later
      temperature: 0.7,
    });

    console.log("🐦 Generated Tweets:\n");
    console.log(response);
  } catch (error) {
    console.error("❌ Error generating tweets:", error);
  }
}

// CLI Input
const topic = readlineSync.question("Enter the topic for your tweets: ");
const tone = readlineSync.question("Enter the tone (e.g., Informative, Funny, Motivational): ");

generateTweets(topic, tone);

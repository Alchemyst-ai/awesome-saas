import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function to generate tweets
async function generateTweets(topic: string, tone: string) {
  try {
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const report = completion.choices[0]?.message?.content || "No tweets generated.";
    console.log("🐦 Generated Tweets:\n");
    console.log(report);
  } catch (error) {
    console.error("❌ Error generating tweets:", error);
  }
}

// CLI input
const topic = readlineSync.question("Enter the topic for your tweets: ");
const tone = readlineSync.question("Enter the tone (e.g., Informative, Funny, Motivational): ");

generateTweets(topic, tone);

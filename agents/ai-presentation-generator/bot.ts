import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing Alchemyst AI API key.");
  process.exit(1);
}

const alchemyst = new AlchemystAI({
  apiKey: ALCHEMYST_AI_API_KEY,
});

async function generatePresentation(topic: string, style: string) {
  try {
    console.log(`\n🎯 Generating AI Presentation for: "${topic}" in style: "${style}"\n`);

    const response = await alchemyst.agents.run({
      name: "ai-presentation-generator",
      instructions: `
You are an expert presentation designer.
Your job is to generate a full presentation outline.

Topic: ${topic}
Style: ${style}

Format:
## Presentation: ${topic}

Slide 1: [Title]
- Bullet 1
- Bullet 2
- Bullet 3
[Visual Suggestion: ...]

Slide 2: [Title]
- Bullet points
[Visual Suggestion: ...]

Keep it concise, visually appealing, and structured.
      `,
      output: {
        format: "text",
      },
    });

    console.log("📊 Generated Presentation:\n");
    console.log(response.output.text || "⚠️ No output generated.");
  } catch (err: any) {
    console.error("❌ Error generating presentation:", err.message);
  }
}

const topic = readlineSync.question("Enter presentation topic: ");
const style = readlineSync.question("Enter presentation style (Formal, Creative, Motivational, etc.): ");

generatePresentation(topic, style);

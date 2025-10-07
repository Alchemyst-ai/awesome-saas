import AlchemystAI from "@alchemystai/sdk";
import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!OPENAI_API_KEY || !ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing API keys. Please add both OPENAI_API_KEY and ALCHEMYST_AI_API_KEY in your .env file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const alchemyst = new AlchemystAI({ apiKey: ALCHEMYST_AI_API_KEY });

async function generatePresentation(topic: string, style: string) {
  try {
    console.log(`\n🎯 Generating Presentation for "${topic}" in style "${style}"...\n`);

    // Step 1: Use AlchemystAI to prepare optimized instructions for OpenAI
    const instructions = await alchemyst.agents.run({
      name: "ai-presentation-generator",
      instructions: `
You are a presentation creation orchestrator.
Optimize the prompt for generating a structured, clear, and professional presentation.
Include sections like:
1. Slide titles
2. Bullet points per slide
3. Visual suggestions

Topic: ${topic}
Style: ${style}
      `,
      output: { format: "text" },
    });

    const refinedPrompt = instructions.output.text || `
Create a professional presentation about "${topic}" in "${style}" style.
`;

    // Step 2: Use OpenAI for actual content generation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert presentation designer and educator.",
        },
        {
          role: "user",
          content: refinedPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const report = completion.choices[0]?.message?.content || "⚠️ No content generated.";
    console.log("📊 Generated Presentation:\n");
    console.log(report);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

const topic = readlineSync.question("Enter the presentation topic: ");
const style = readlineSync.question("Enter the style/tone (Formal, Creative, Motivational, etc.): ");

generatePresentation(topic, style);

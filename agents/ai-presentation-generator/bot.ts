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

async function generatePresentation(topic: string, style: string) {
  console.log(`\n🧠 Using Alchemyst memory + OpenAI model...`);
  console.log(`🎯 Topic: "${topic}" | Style: "${style}"\n`);

  
  await alchemyst.memory.store({
    namespace: "presentation-generator",
    data: { topic, style, createdAt: new Date().toISOString() },
  });

  
  const orchestration = await alchemyst.agents.run({
    name: "ai-presentation-generator",
    instructions: `
You are an expert presentation architect.
Your goal is to design a professional, well-structured slide deck outline.

Topic: ${topic}
Style: ${style}

Output format:
## Presentation: ${topic}
Slide 1: [Title]
- Bullet 1
- Bullet 2
[Visual Suggestion: ...]
Slide 2: [Title]
- Bullet points
[Visual Suggestion: ...]
Keep it creative, informative, and consistent with the chosen style.
    `,
    output: { format: "text" },
  });

  const refinedPrompt = orchestration.output.text || `
Create a professional presentation on "${topic}" in a "${style}" tone.
Include slide titles, bullet points, and visual suggestions.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a presentation designer and educator." },
      { role: "user", content: refinedPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const presentation = response.choices[0]?.message?.content || "⚠️ No presentation generated.";
  console.log("\n📊 Generated Presentation Outline:\n");
  console.log(presentation);

  
  await alchemyst.memory.store({
    namespace: "presentation-generator",
    data: { topic, style, presentation },
  });
}


async function viewHistory() {
  const past = await alchemyst.memory.retrieve({ namespace: "presentation-generator" });
  if (!past?.length) return console.log("📭 No previous presentations found.");

  console.log("\n📜 Previous Presentations:\n");
  past.forEach((p: any, i: number) => {
    console.log(`${i + 1}. ${p.topic} (${p.style})`);
  });
}

(async () => {
  const action = readlineSync.question("\nChoose an action:\n1️⃣ Generate Presentation\n2️⃣ View History\n> ");

  if (action === "2") return await viewHistory();

  const topic = readlineSync.question("Enter the presentation topic: ");
  const style = readlineSync.question("Enter the presentation style (Formal, Creative, Motivational, etc.): ");
  await generatePresentation(topic, style);
})();

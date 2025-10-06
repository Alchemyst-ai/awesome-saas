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

// Function to generate presentation
async function generatePresentation(topic: string, style: string) {
  try {
    console.log(`\n🎯 Generating presentation for topic: "${topic}" with style: "${style}"\n`);

    const prompt = `
You are an expert presentation designer.
Create a structured presentation for the following topic:
- Topic: ${topic}
- Style/Tone: ${style}

Include:
- Slide titles
- Key bullet points for each slide
- Notes or suggestions for visuals/images if applicable

Provide the output in a structured format:

## Presentation: ${topic}
Slide 1: Title
- Bullet points
Slide 2: Title
- Bullet points
...
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const report = completion.choices[0]?.message?.content || "No presentation generated.";
    console.log("📊 Generated Presentation Outline:\n");
    console.log(report);
  } catch (error) {
    console.error("❌ Error generating presentation:", error);
  }
}

// CLI input
const topic = readlineSync.question("Enter the presentation topic: ");
const style = readlineSync.question("Enter the style/tone (e.g., Formal, Creative, Motivational): ");

generatePresentation(topic, style);

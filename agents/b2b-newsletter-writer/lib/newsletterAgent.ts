//1) install Google GenAI sdk and alchemystai typescript sdk
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { searchContext } from "./alchemyst";
import { z } from "zod";

export type NewsletterInput = {
  companyName: string;
  audience: string;
  topic: string;
  tone: string;
};

export type Newsletter = {
  subject: string;
  shortBody: string;
  longBody: string;
  cta: string;
};

const fallbackNewsletter = (input: NewsletterInput): Newsletter => {
  const { companyName, audience, topic, tone } = input;
  console.log("Fallback");
  return {
    subject: `Your ${tone} update on ${topic}`,
    shortBody: `Hi ${audience}, here’s a quick update from ${companyName} on ${topic}. Stay informed and ready to act with our insights.`,
    longBody: `Hi ${audience},

This edition of our ${tone.toLowerCase()} newsletter from ${companyName} covers the most important developments in ${topic}. We break down the changes, their impact on your business, and provide actionable strategies to help you stay ahead.

At ${companyName}, we’re committed to delivering clarity and practical solutions. As ${audience}, you’ll find our perspectives designed to empower your decision-making and sharpen your competitive edge.

Thank you for staying connected with us—your growth is at the core of what we do.`,
    cta: `Learn more with ${companyName}`,
  };
};

export async function generateNewsletter(
  input: NewsletterInput
): Promise<Newsletter> {
  const { companyName, audience, topic, tone } = input;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return fallbackNewsletter(input);

  if (apiKey) {
    try {

      const contexts = await searchContext(topic);

      const client = new GoogleGenAI({ apiKey });
      const prompt = `
You are a professional B2B newsletter writer for "${companyName}".
Use the following company information as primary reference:

${contexts}

If this information is insufficient, rely on your own knowledge.
Audience: ${audience}
Topic: ${topic}
Tone: ${tone}.

Return ONLY a strict JSON object with the following structure:

{
  "subject": "A compelling newsletter subject line, max 10 words, plain text",
  "shortBody": "50–100 word professional newsletter text. Smooth, natural, no headings, no numbers, no bullet points, no meta commentary.",
  "longBody": "150–200 word expanded newsletter text. Smooth, professional, no headings, no numbers, no bullet points, no meta commentary.",
  "cta": "A single strong call-to-action sentence, e.g., 'Schedule a demo today.'"
}

Do not include anything else outside this JSON. No explanations, no greetings, no code blocks.
`;

      const res = await client.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const raw =
        res.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n\n") ??
        "";

      const cleanedText = raw
        .replace(/^[\s`]*```json[\s`]*/i, "") // Remove opening ```json with spaces
        .replace(/[\s`]*```$/i, "") // Remove closing ```
        .trim();

      const newsletterSchema = z.object({
        subject: z.string(),
        shortBody: z.string(),
        longBody: z.string(),
        cta: z.string(),
      });

      let ans: Newsletter;

      try {
        const json = JSON.parse(cleanedText);
        const parsed = newsletterSchema.safeParse(json);
        if (parsed.success) {
          ans = parsed.data;
        } else {
          console.warn(
            "[Gemini] Validation failed, using fallback.",
            parsed.error
          );
          ans = fallbackNewsletter(input);
        }
      } catch (err) {
        console.warn("[Gemini] JSON parsing failed, using fallback.", err);
        ans = fallbackNewsletter(input);
      }

      return {
        subject: ans.subject,
        shortBody: ans.shortBody,
        longBody: ans.longBody,
        cta: ans.cta,
      };
    } catch (e) {
      console.error("[Gemini] Fallback due to error:", (e as Error).message);
      return fallbackNewsletter(input);
    }
  } else {
    return fallbackNewsletter(input);
  }
}

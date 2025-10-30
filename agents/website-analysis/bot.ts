import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { escape } from "he"; // npm i he

dotenv.config();

// Load API key
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;
if (!ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing Alchemyst AI API key. Please set ALCHEMYST_AI_API_KEY in .env");
  process.exit(1);
}

// Initialize Alchemyst AI SDK client
const alchemyst = new AlchemystAI({
  apiKey: ALCHEMYST_AI_API_KEY,
  memory: true, // enables contextual memory
});

// Fetch website HTML
async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error("❌ Error fetching website:", error);
    return null;
  }
}

// Analyze website using Alchemyst memory-enabled agent
async function analyzeWebsite(url: string) {
  if (!url.startsWith("http")) {
    console.error("🌐 Please provide a valid website URL.");
    return;
  }

  const htmlContent = await fetchWebsiteContent(url);
  if (!htmlContent) return;

  console.log(`🔍 Analyzing website: ${url} ...`);

  // Sanitize HTML to avoid raw HTML warnings
  const sanitizedHtml = escape(htmlContent);

  const prompt = `
You are a professional website auditor.
Analyze the following website content for:
- SEO
- Performance
- Accessibility
- UI/UX Design
- Security Recommendations

Website URL: ${url}

Sanitized Website HTML content:
${sanitizedHtml}

Provide a structured report in this format:

## Overview
## SEO Analysis
## Performance Insights
## Accessibility & UX
## Security Recommendations
## Final Summary
`;

  try {
    // ✅ Official Alchemyst SDK method (from the tutorial series)
    const response = await alchemyst.respond({
      model: "gpt-4o-mini", // or use your configured default
      prompt,
      memoryScope: "persistent", // stores long-term analysis memory
      temperature: 0.5,
      maxTokens: 2000,
      metadata: {
        agent: "website-analysis",
        urlAnalyzed: url,
      },
    });

    console.log("🧾 Website Analysis Report:\n", response.output || response.text);
  } catch (error) {
    console.error("❌ Error analyzing website:", error);
  }
}

// Run the analysis safely
(async () => {
  try {
    await analyzeWebsite("https://example.com");
  } catch (err) {
    console.error("❌ Unexpected runtime error:", err);
  }
})();

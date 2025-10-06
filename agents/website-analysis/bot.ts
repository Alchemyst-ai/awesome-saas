import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Environment setup
const ALCHEMYST_AI_API_KEY = process.env.ALCHEMYST_AI_API_KEY;

if (!ALCHEMYST_AI_API_KEY) {
  console.error("❌ Missing Alchemyst AI API key.");
  process.exit(1);
}

// Initialize the Alchemyst AI SDK
const alchemyst = new AlchemystAI({
  apiKey: ALCHEMYST_AI_API_KEY,
  memory: true, // enables persistent contextual memory for the agent
});

// Fetch website HTML
async function fetchWebsiteContent(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error("❌ Error fetching website:", error);
    return null;
  }
}

// Website analysis agent logic
async function analyzeWebsite(url: string) {
  if (!url.startsWith("http")) {
    console.error("🌐 Please provide a valid website URL.");
    return;
  }

  const htmlContent = await fetchWebsiteContent(url);
  if (!htmlContent) return;

  console.log(`🔍 Analyzing website: ${url}...`);

  const prompt = `
You are a professional website auditor with memory capabilities.
Analyze the following website content for:
- SEO
- Performance
- Accessibility
- UI/UX Design
- Security Recommendations

Website URL: ${url}

Website HTML content:
${htmlContent}

Provide a structured report in this format:

## Overview
## SEO Analysis
## Performance Insights
## Accessibility & UX
## Security Recommendations
## Final Summary
  `;

  try {
    // Ask the memory-powered Alchemyst AI agent
    const response = await alchemyst.agents.run({
      name: "website-analysis-agent",
      instructions: prompt,
      memoryScope: "persistent", // remembers past analyses
      outputFormat: "markdown",
      temperature: 0.5,
      maxTokens: 2000,
    });

    console.log("🧾 Website Analysis Report:\n", response.output);
  } catch (error) {
    console.error("❌ Error analyzing website:", error);
  }
}

// Example usage
analyzeWebsite("https://example.com");

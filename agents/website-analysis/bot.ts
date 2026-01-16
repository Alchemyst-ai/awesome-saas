import OpenAI from "openai";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function to fetch website HTML
async function fetchWebsiteContent(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const html = await res.text();
    return html;
  } catch (error) {
    console.error("❌ Error fetching website:", error);
    return null;
  }
}

// Main website analysis function
async function analyzeWebsite(url: string) {
  if (!url.startsWith("http")) {
    console.error("🌐 Please provide a valid website URL.");
    return;
  }

  const htmlContent = await fetchWebsiteContent(url);
  if (!htmlContent) return;

  try {
    console.log(`🔍 Analyzing website: ${url}...`);

    const prompt = `
You are a professional website auditor.
Analyze the following website content for:
- SEO
- Performance
- Accessibility
- UI/UX Design
- Security Recommendations

Website URL: ${url}

Website HTML content:
${htmlContent}

Provide a detailed report in this format:

## Overview
## SEO Analysis
## Performance Insights
## Accessibility & UX
## Security Recommendations
## Final Summary
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const report = completion.choices[0]?.message?.content || "No report generated.";
    console.log("🧾 Website Analysis Report:\n", report);
  } catch (error) {
    console.error("❌ Error analyzing website:", error);
  }
}

// Replace with any website you want
analyzeWebsite("https://example.com");

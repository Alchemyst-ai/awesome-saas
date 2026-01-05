import { NextResponse } from "next/server";
import { alchemyst } from "@/lib/alchemyst";
import OpenAI from "openai";
import { metadata } from "@/app/layout";

interface AlchemystItem {
  document?: string;
  content?: string;
  metadata?: {
    fileName?: string;
    [key: string]: any;
  };
  body_metadata?: {
    groupName?: string;
    [key: string]: any;
  };
  fileName?: string;
  [key: string]: any;
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Github Repo Explainer",
  },
});

function extractKeywords(query: string): string {
  let cleaned = query
    .toLowerCase()
    .replace(/^(how do i|how to|what is|what are|can you|please|explain|show me|tell me about)\s+/gi, '')
    .replace(/\?/g, '')
    .trim();

  return cleaned || query;
}

export async function POST(req: Request) {
  try {
    const { message, groupName } = await req.json();

    if (!message) return NextResponse.json({ ok: false, error: "No message" });

    const searchQuery = extractKeywords(message);
    console.log(`\n🔍 ========== NEW SEARCH ==========`);
    console.log(`📝 Original: "${message}"`);
    console.log(`🔑 Keywords: "${searchQuery}"`);
    console.log(`📦 Group: "${groupName}"`);

    let searchRes;
    let searchMethod = "none";

    // PASS 1: Semantic search with original query
    try {
      console.log(`\n🎯 PASS 1: Semantic search (threshold: 0.35)`);
      searchRes = await alchemyst.v1.context.search({
        query: message,
        similarity_threshold: 0.40,
        minimum_similarity_threshold: 0.30,
        scope: 'internal',
        body_metadata: groupName ? { groupName: [groupName] } : undefined,
        metadata: "true"
      });

      if (searchRes.contexts && searchRes.contexts.length > 0) {
        searchMethod = "semantic";
        console.log(`✅ Found ${searchRes.contexts.length} results`);
      } else {
        console.log(`❌ No results`);
      }
    } catch (e: any) {
      console.error(`⚠️ Pass 1 error:`, e.message);
    }

    // PASS 2: Keyword search
    if (!searchRes?.contexts || searchRes.contexts.length === 0) {
      console.log(`\n🎯 PASS 2: Keyword search (threshold: 0.25)`);
      try {
        searchRes = await alchemyst.v1.context.search({
          query: searchQuery,
          similarity_threshold: 0.25,
          minimum_similarity_threshold: 0.25,
          scope: 'internal',
          body_metadata: groupName ? { groupName: [groupName] } : undefined,
          metadata: "true"
        });

        console.log(metadata)

        if (searchRes.contexts && searchRes.contexts.length > 0) {
          searchMethod = "keyword";
          console.log(`✅ Found ${searchRes.contexts.length} results`);
        } else {
          console.log(`❌ No results`);
        }
      } catch (e: any) {
        console.error(`⚠️ Pass 2 error:`, e.message);
      }
    }

    // PASS 3: Broad search (no group filter as last resort)
    if (!searchRes?.contexts || searchRes.contexts.length === 0) {
      console.log(`\n🎯 PASS 3: Broad search WITHOUT group filter (threshold: 0.15)`);
      try {
        searchRes = await alchemyst.v1.context.search({
          query: searchQuery,
          similarity_threshold: 0.15,
          minimum_similarity_threshold: 0.15,
          scope: 'internal',
          // NO body_metadata filter here - search everything
          metadata: "true"
        });

        console.log(metadata)

        if (searchRes.contexts && searchRes.contexts.length > 0) {
          searchMethod = "broad";
          console.log(`✅ Found ${searchRes.contexts.length} results (across ALL groups)`);
        } else {
          console.log(`❌ Still no results even without filters`);
        }
      } catch (e: any) {
        console.error(`⚠️ Pass 3 error:`, e.message);
      }
    }

    // PASS 4: Check if ANY data exists for this group
    if (!searchRes?.contexts || searchRes.contexts.length === 0) {
      console.log(`\n🎯 PASS 4: Checking if group "${groupName}" has ANY data...`);
      try {
        const checkRes = await alchemyst.v1.context.search({
          query: "function class export import", // Generic terms
          similarity_threshold: 0.01,
          minimum_similarity_threshold: 0.01,
          scope: 'internal',
          body_metadata: groupName ? { groupName: [groupName] } : undefined,
          metadata: "true"
        });

        if (!checkRes.contexts || checkRes.contexts.length === 0) {
          console.log(`⚠️ NO DATA FOUND for group "${groupName}" - Repository may not be ingested!`);
          return NextResponse.json({
            ok: true,
            answer: `⚠️ **No Data Found for "${groupName}"**

It looks like this repository hasn't been ingested yet, or the ingestion failed.

**Next steps:**
1. Click the **Ingest** button again
2. Check the console for ingestion errors
3. Make sure the repository URL is valid
4. Try a different repository to test

If you just ingested it, wait 10-30 seconds for indexing to complete.`,
            sources: [],
            debug: {
              groupName,
              searchMethod: "data_check_failed",
              totalResults: 0
            }
          });
        } else {
          console.log(`✅ Found ${checkRes.contexts.length} documents in group, but query didn't match`);
        }
      } catch (e: any) {
        console.error(`⚠️ Pass 4 error:`, e.message);
      }
    }

    const data = (searchRes?.contexts || []) as AlchemystItem[];
    console.log(`\n📊 Final Results: ${data.length} items using ${searchMethod} search`);

    if (data.length === 0) {
      return NextResponse.json({
        ok: true,
        answer: `I searched the "${groupName}" repository but couldn't find code related to **"${searchQuery}"**. 

**This could mean:**
- The repository doesn't contain information about this topic
- Try more specific terms (e.g., function names like \`on()\`, \`emit()\`)
- The search terms don't match the code content

**Suggestions:**
- Ask: "What functions are exported?"
- Ask: "Show me the main file"
- Use exact function/variable names from the repo

What would you like to explore?`,
        sources: [],
        debug: {
          originalQuery: message,
          extractedKeywords: searchQuery,
          searchMethod,
          totalResults: 0
        }
      });
    }

    // Log what we found
    console.log(`\n📄 Found files:`);
    data.slice(0, 5).forEach((item, i) => {
      const name = item.metadata?.fileName || item.fileName || item.body_metadata?.fileName || "Unknown";
      const contentPreview = (item.content || item.document || "").substring(0, 100);
      // console.log(`  ${i + 1}. ${name}`);
      // console.log(`     Preview: ${contentPreview}...`);
    });

    // Build context
    const MAX_CONTEXT = 12000;
    let contextData = "";
    const sources: string[] = [];

    for (const item of data) {
      const content = item.content || item.document || "";
      if (!content) continue;

      // Debug: log first item structure
      if (sources.length === 0) {
        console.log("🔍 First item keys:", Object.keys(item));
        console.log("🔍 First item:", JSON.stringify(item, null, 2).slice(0, 1000));
      }

      // Try to extract fileName from metadata
      let name =
        item.metadata?.fileName ||
        item.body_metadata?.fileName ||
        (item as any).fileName ||
        (item as any).file_name ||
        null;

      // If no metadata, try to extract from content header (// FILE: pattern)
      if (!name) {
        // Debug: log content start to see if FILE header exists
        if (sources.length === 0) {
          console.log("🔍 Content start:", content.slice(0, 200));
          console.log("🔍 Has FILE header:", content.includes("// FILE:") || content.includes("# FILE:"));
        }
        const pathMatch = content.match(/(?:\/\/|#)\s*FILE:\s*([^\n\r]+)/i);
        if (pathMatch) {
          name = pathMatch[1].trim();
          console.log("✅ Extracted filename:", name);
        }
      }

      // Fallback to "Unknown File" if no real filename found
      name = name || "Unknown File";

      const chunk = `\n<<< FILE: ${name} >>>\n${content}\n<<< END OF FILE >>>\n`;

      if ((contextData.length + chunk.length) < MAX_CONTEXT) {
        contextData += chunk;
        // Only add real filenames to sources (not "Unknown File")
        if (name !== "Unknown File" && !sources.includes(name)) {
          sources.push(name);
        }
      }
    }

    console.log(`✅ Context built: ${contextData.length} chars from ${sources.length} files`);

    if (!contextData.trim()) {
      return NextResponse.json({
        ok: false,
        error: "Found documents but couldn't extract content",
      }, { status: 500 });
    }

    // Generate answer
    const systemPrompt = `You are a Senior Developer analyzing the "${groupName}" repository.

INSTRUCTIONS:
1. Answer using ONLY the provided code files
2. Explain clearly with code examples from the files
3. Cite files: "In index.js, the on() function..."
4. If info is missing, say: "I don't see that in these files. Try asking about specific functions."
5. Be helpful and thorough

Format code with markdown.`;

    const completion = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Question: "${message}"\n\nCode Context:\n${contextData}` },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || "No response generated";

    console.log(`✅ Answer generated (${answer.length} chars)`);
    console.log(`========== SEARCH COMPLETE ==========\n`);

    return NextResponse.json({
      ok: true,
      answer,
      sources: sources,
      debug: {
        searchMethod,
        filesFound: data.length,
        filesIncluded: sources.length,
        contextSize: contextData.length
      }
    });

  } catch (error: any) {
    console.error("❌ CHAT ERROR:", error);
    console.error("Stack:", error.stack);

    return NextResponse.json({
      ok: false,
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
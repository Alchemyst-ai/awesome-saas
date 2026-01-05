import { NextResponse } from "next/server";
import { alchemyst } from "@/lib/alchemyst";
import OpenAI from "openai";

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

const sectionPrompts: Record<string, string> = {
  introduction: `Generate a comprehensive introduction for this repository. Include:
- What the project does and its main purpose
- Key features and capabilities
- Technology stack used
- Target audience
- Brief overview of the codebase structure

Base your response on the actual code files provided. Be specific and reference actual components/files.`,

  architecture: `Analyze and document the architecture of this repository:
- Overall system architecture and design patterns
- Key components/modules and their relationships
- Directory structure and organization
- How different parts of the system interact
- Data flow and component hierarchy

Reference actual files and components from the codebase.`,

  "quick-start": `Create a quick start guide for this repository:
- Prerequisites and requirements
- Installation steps (reference package.json, requirements.txt, etc.)
- Basic setup and configuration
- How to run the project locally
- First steps to get started

Use actual information from configuration files in the codebase.`,

  components: `Document the main components/modules:
- List key components and their purposes
- Component hierarchy and relationships
- How components interact with each other
- Key props/interfaces used

Reference actual component files from the codebase.`,

  "state-management": `Explain the state management approach:
- State management library/pattern used (Redux, Zustand, Context API, etc.)
- How state is structured and organized
- Key state stores/contexts
- Data flow patterns
- State update mechanisms

Reference actual state management files.`,

  routing: `Document the routing structure:
- Routing library/framework used
- Main routes and their purposes
- Route structure and organization
- Navigation patterns
- Protected routes or special routing logic

Reference actual routing configuration files.`,

  functions: `List and document key functions:
- Important utility functions
- API/service functions
- Helper functions
- Their purposes, parameters, and usage examples

Reference actual function definitions from the codebase.`,

  classes: `Document classes in the codebase:
- Main classes and their purposes
- Class hierarchy and inheritance
- Key methods and their purposes
- Usage patterns and examples

Reference actual class definitions.`,

  types: `Document TypeScript types/interfaces:
- Key type definitions and interfaces
- Interface structures and relationships
- Type relationships and dependencies
- Usage examples

Reference actual type definition files.`,
};

export async function POST(req: Request) {
  try {
    const { owner, repo, section, groupName } = await req.json();

    if (!owner || !repo || !section) {
      return NextResponse.json(
        { ok: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const finalGroupName = groupName || repo;
    const prompt = sectionPrompts[section] || `Generate comprehensive documentation for the ${section} section based on the codebase.`;

    console.log(`\n📚 Generating docs for: ${section} (${owner}/${repo})`);

    // Search for relevant code context
    let searchRes;
    let contextData = "";
    const sources: string[] = [];

    // Try semantic search first
    try {
      searchRes = await alchemyst.v1.context.search({
        query: section === "introduction"
          ? "main purpose features technology stack overview"
          : section === "architecture"
            ? "architecture structure components modules design patterns"
            : section === "quick-start"
              ? "installation setup configuration run start"
              : section,
        similarity_threshold: 0.3,
        minimum_similarity_threshold: 0.3,
        scope: 'internal',
        body_metadata: { groupName: [finalGroupName] },
      });

      if (searchRes.contexts && searchRes.contexts.length > 0) {
        console.log(`✅ Found ${searchRes.contexts.length} relevant files`);
      }
    } catch (e: any) {
      console.error(`⚠️ Search error:`, e.message);
    }

    // If no results, try broader search
    if (!searchRes?.contexts || searchRes.contexts.length === 0) {
      try {
        searchRes = await alchemyst.v1.context.search({
          query: "function class export import component",
          similarity_threshold: 0.2,
          minimum_similarity_threshold: 0.2,
          scope: 'internal',
          body_metadata: { groupName: [finalGroupName] },
        });
      } catch (e: any) {
        console.error(`⚠️ Broad search error:`, e.message);
      }
    }

    const data = (searchRes?.contexts || []) as AlchemystItem[];

    // Build context from search results
    const MAX_CONTEXT = 15000;
    for (const item of data.slice(0, 10)) {
      const content = item.content || item.document || "";
      if (!content) continue;

      // Try to extract fileName from metadata or content header
      let name = item.metadata?.fileName || item.body_metadata?.fileName || item.fileName || null;

      // If no metadata, try to extract from content (// FILE: pattern added during ingest)
      if (!name) {
        const pathMatch = content.match(/(?:\/\/|#)\s*FILE:\s*([^\n\r]+)/i);
        if (pathMatch) {
          name = pathMatch[1].trim();
        }
      }

      name = name || "Unknown File";
      const chunk = `\n<<< FILE: ${name} >>>\n${content}\n<<< END OF FILE >>>\n`;

      if ((contextData.length + chunk.length) < MAX_CONTEXT) {
        contextData += chunk;
        if (!sources.includes(name)) {
          sources.push(name);
        }
      }
    }

    if (!contextData.trim()) {
      return NextResponse.json({
        ok: false,
        error: "No code context found. Repository may not be ingested yet.",
      }, { status: 404 });
    }

    console.log(`✅ Context built: ${contextData.length} chars from ${sources.length} files`);

    // Generate documentation using OpenRouter
    const systemPrompt = `You are a Senior Developer creating documentation for the "${owner}/${repo}" repository.

INSTRUCTIONS:
1. Generate comprehensive, well-structured documentation based ONLY on the provided code files
2. Use markdown formatting with proper headings, code blocks, and lists
3. Reference specific files and code examples: "In \`src/components/Button.tsx\`, the component..."
4. Be thorough but concise
5. If information is missing, note it but work with what's available
6. Format code examples with proper syntax highlighting

Generate professional documentation that helps developers understand the codebase.`;

    const userPrompt = `${prompt}\n\nCode Context:\n${contextData}`;

    const completion = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free", // Same free model as chat
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000, // More tokens for documentation
    });

    const content = completion.choices[0]?.message?.content || "Unable to generate documentation.";

    console.log(`✅ Documentation generated (${content.length} chars)`);

    return NextResponse.json({
      ok: true,
      section,
      content,
      sources,
    });

  } catch (e: any) {
    console.error("Documentation generation error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
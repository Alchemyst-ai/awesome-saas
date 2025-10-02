import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
dotenv.config();

const alchemystClient = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_AI_API_KEY,
});

export async function searchContext(query: string) {
  try {
    console.log(`Searching for context with query: ${query}`);

    const { contexts } = await alchemystClient.v1.context.search({
      query,
      similarity_threshold: 0.8,
      minimum_similarity_threshold: 0.5,
      scope: "internal",
      metadata: null,
    });

    if (contexts && contexts.length > 0) {
      console.log(`Found ${contexts.length} relevant contexts`);
      const formattedContexts = contexts
        .map((c, index) => {
          const content = c.content || JSON.stringify(c);
          return content;
        })
        .join("\n\n");
      return formattedContexts;
    } else {
      console.log("No relevant context found");
      return "";
    }
  } catch (error) {
    console.error("Error searching context from AlchemystAI:", error);
    // Return empty string if context search fails - newsletter generation can continue
    return "";
  }
}

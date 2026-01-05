import AlchemystAI from "@alchemystai/sdk";

export const alchemyst = new AlchemystAI({
    apiKey: process.env.ALCHEMYST_AI_API_KEY
})
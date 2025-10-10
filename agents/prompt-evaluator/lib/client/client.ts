import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.ALCHEMYST_AI_API_KEY) {
  console.warn("ALCHEMYST_AI_API_KEY is not set in environment variables.");
}

export const alchemystClient = new AlchemystAI({
    apiKey: process.env.ALCHEMYST_AI_API_KEY,
  });
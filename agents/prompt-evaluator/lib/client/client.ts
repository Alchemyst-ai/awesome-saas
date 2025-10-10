import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.ALCHEMYST_API_KEY) {
  console.warn("ALCHEMYST_AI_API_KEY is not set in environment variables.");
}

const apiKey = process.env.ALCHEMYST_API_KEY || "";

if (!apiKey) {
  throw new Error(
    "ALCHEMYST_AI_API_KEY is not set in environment variables. " +
    "Please add it to your .env file."
  );
}

export const alchemystClient = new AlchemystAI({
    apiKey: apiKey,
  });
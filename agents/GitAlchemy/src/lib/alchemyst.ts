import AlchemystAI from "@alchemystai/sdk";

// Lazy-initialize Alchemyst client to avoid build-time errors
let _alchemyst: AlchemystAI | null = null;

export function getAlchemyst(): AlchemystAI {
    if (!_alchemyst) {
        _alchemyst = new AlchemystAI({
            apiKey: process.env.ALCHEMYST_AI_API_KEY
        });
    }
    return _alchemyst;
}

// Keep for backward compatibility, but this will error at build time
// Use getAlchemyst() instead in API routes
export const alchemyst = {
    get v1() {
        return getAlchemyst().v1;
    }
};
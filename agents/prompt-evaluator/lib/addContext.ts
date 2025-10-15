
import { alchemystClient } from "./client/client";
const client = alchemystClient;

export async function addContext(prompt: string, evaluationResult?: unknown) {
    const content = evaluationResult 
        ? `PROMPT: ${prompt}\n\nEVALUATION RESULT: ${JSON.stringify(evaluationResult, null, 2)}`
        : prompt;
        
    await client.v1.context.add({
        documents: [{ content }],
        context_type: "resource",
        source: "web-uploaded",
        scope: "internal",
        metadata: {
            fileName: `prompt-${Date.now()}.txt`,
            fileType: "text/plain",
            lastModified: new Date().toISOString(),
            fileSize: content.length,
        }
    });
    // console.log("Context added successfully for prompt");
}
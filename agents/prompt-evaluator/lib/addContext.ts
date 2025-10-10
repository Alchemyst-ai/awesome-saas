
import { alchemystClient } from "./client/client";
const client = alchemystClient;

export async function addContext(prompt: string) {
    await client.v1.context.add({
        documents: [{ prompt}],
        context_type: "resource",
        source: "web-upload",
        scope: "internal",
        metadata: {
            fileName: "prompt",
            fileType: "text/plain",
            lastModified: new Date().toISOString(),
            fileSize: prompt.length,
        }
    });
    console.log("Context added successfully for prompt");
}
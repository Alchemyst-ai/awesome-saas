import fs from "fs/promises";
import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.ALCHEMYST_AI_API_KEY) {
  console.warn("ALCHEMYST_AI_API_KEY is not set in environment variables.");
}

const alchemystClient = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_AI_API_KEY,
});

async function parseFileContent(
  filePath: string,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    throw new Error(
      "PDF parsing is not currently supported. Please use JSON files."
    );
  } else if (mimeType === "application/json" || mimeType === "text/json") {
    const raw = await fs.readFile(filePath, "utf-8");
    return raw;
  } else {
    return await fs.readFile(filePath, "utf-8");
  }
}

export async function addContext(
  content: string,
  fileName: string,
  mimeType: string
) {
  await alchemystClient.v1.context.add({
    documents: [{ content }],
    context_type: "resource",
    source: "web-upload",
    scope: "internal",
    metadata: {
      fileName,
      fileType: mimeType,
      lastModified: new Date().toISOString(),
      fileSize: content.length,
    },
  });
  console.log(`Context added successfully for file: ${fileName}`);
}

export async function addContextFromFile(
  filePath: string,
  fileName: string,
  mimeType: string
) {
  const content = await parseFileContent(filePath, mimeType);
  await addContext(content, fileName, mimeType);
}

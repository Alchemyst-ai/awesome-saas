import fs from "fs/promises";
import AlchemystAI from "@alchemystai/sdk";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.ALCHEMYST_AI_API_KEY);

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
  try {
    console.log(`Attempting to add context for file: ${fileName}`);
    console.log(`Content length: ${content.length}`);
    console.log(`MIME type: ${mimeType}`);

    const result = await alchemystClient.v1.context.add({
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
    return result;
  } catch (error) {
    console.error(`Failed to add context for file ${fileName}:`, error);

    // Check if it's an AlchemystAI API error
    if (error && typeof error === "object" && "status" in error) {
      console.error(`API Error - Status: ${(error as any).status}`);
      console.error(`API Error - Details:`, (error as any).error);
    }

    // For now, let's not throw the error to allow the newsletter generation to continue
    // without context if the AlchemystAI service is having issues
    console.warn(`Continuing without context due to AlchemystAI API issue...`);
    return null;
  }
}

export async function addContextFromFile(
  filePath: string,
  fileName: string,
  mimeType: string
) {
  const content = await parseFileContent(filePath, mimeType);
  await addContext(content, fileName, mimeType);
}

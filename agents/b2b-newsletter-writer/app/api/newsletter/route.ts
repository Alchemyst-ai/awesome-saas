export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateNewsletter } from "@/lib/newsletterAgent";
import { addContext } from "@/lib/addContext";

function extractJsonContentFromBuffer(buffer: Buffer): string {
  const content = buffer.toString("utf-8");
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error("[v0] Invalid JSON content:", error);
    throw new Error("File content must be valid JSON.");
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();

    const companyName = data.get("companyName") as string | null;
    const audience = data.get("audience") as string | null;
    const topic = data.get("topic") as string | null;
    const tone = data.get("tone") as string | null;
    const file = data.get("file") as File | null;

    if (!companyName || !audience || !topic || !tone || !file) {
      return NextResponse.json(
        { error: "Missing required fields or file" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "Cannot process an empty file." },
        { status: 400 }
      );
    }

    // Extract and validate JSON content
    const fileContent = extractJsonContentFromBuffer(fileBuffer);

    // Add context from the uploaded file (continue even if this fails)
    try {
      await addContext(fileContent, file.name, file.type);
      console.log("Context successfully added to AlchemystAI");
    } catch (contextError) {
      console.warn(
        "Failed to add context to AlchemystAI, continuing without context:",
        contextError
      );
    }

    // Generate newsletter using AI
    const newsletter = await generateNewsletter({
      companyName,
      audience,
      topic,
      tone,
    });

    return NextResponse.json({ newsletter });
  } catch (error) {
    console.error("[v0] API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

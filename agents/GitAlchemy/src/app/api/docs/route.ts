import { NextRequest, NextResponse } from "next/server";
import { getStoredDocs, updateStoredSection } from "@/lib/docs-storage";

// GET - Retrieve stored documentation for a repo
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");

        if (!owner || !repo) {
            return NextResponse.json(
                { ok: false, error: "Missing owner or repo parameter" },
                { status: 400 }
            );
        }

        const documentation = await getStoredDocs(owner, repo);

        return NextResponse.json({
            ok: true,
            documentation: documentation || {},
        });
    } catch (error: any) {
        console.error("Error retrieving docs:", error);
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Save a section of documentation
export async function POST(request: NextRequest) {
    try {
        const { owner, repo, section, content } = await request.json();

        if (!owner || !repo || !section) {
            return NextResponse.json(
                { ok: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        await updateStoredSection(owner, repo, section, content);

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Error saving docs:", error);
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}

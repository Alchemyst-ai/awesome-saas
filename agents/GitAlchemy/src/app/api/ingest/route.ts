import { NextResponse } from "next/server";
import { alchemyst } from "@/lib/alchemyst";

function parseRepoUrl(repoUrl: string) {
  // Handle both full URLs and owner/repo format
  if (repoUrl.includes("github.com")) {
    const u = new URL(repoUrl);
    const [owner, repo] = u.pathname.replace(/^\/+/, "").split("/").slice(0, 2);
    if (!owner || !repo) throw new Error("Invalid GitHub repo URL");
    return { owner, repo };
  } else {
    // Handle owner/repo format
    const parts = repoUrl.split("/").filter(Boolean);
    if (parts.length < 2) throw new Error("Invalid repo format. Use owner/repo or full GitHub URL");
    return { owner: parts[0], repo: parts[1] };
  }
}

async function ghFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };

  if (!process.env.GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_TOKEN (required to avoid rate limits)");
  }

  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function ghFetchRaw(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub raw error ${res.status}: ${await res.text()}`);
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (!json.content) throw new Error("Missing file content");
    return Buffer.from(json.content, "base64").toString("utf-8");
  }

  return res.text();
}

export async function POST(req: Request) {
  try {
    const { repoUrl, ref, groupName } = await req.json();
    const { owner, repo } = parseRepoUrl(repoUrl);

    /* 1️⃣ Repo info */
    const repoInfo = await ghFetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    /* 2️⃣ Resolve branch safely */
    let branchName = ref || repoInfo.default_branch;
    let branchInfo;

    try {
      branchInfo = await ghFetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${branchName}`
      );
    } catch {
      branchName = repoInfo.default_branch;
      branchInfo = await ghFetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${branchName}`
      );
    }

    const treeSha = branchInfo.commit.commit.tree.sha;

    /* 3️⃣ Fetch full tree */
    const tree = await ghFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`
    );

    const files = (tree.tree ?? [])
      .filter((n: any) => n.type === "blob")
      .filter((n: any) => typeof n.path === "string")
      .filter(
        (n: any) =>
          !n.path.includes("node_modules/") &&
          !n.path.includes("dist/") &&
          !n.path.includes(".next/") &&
          !n.path.includes("build/")
      )
      .filter((n: any) =>
        /\.(md|mdx|ts|tsx|js|jsx|json|yml|yaml|py|go|java|rs|c|cpp|h|sql|prisma|env\.example)$/i.test(
          n.path
        )
      );

    console.log(`📁 Found ${files.length} files to process`);

    /* 4️⃣ Fetch + Ingest Loop */
    const maxFiles = 100;
    let successCount = 0;
    const errors: string[] = [];

    for (const f of files.slice(0, maxFiles)) {
      try {
        const rawUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
          f.path
        )}?ref=${encodeURIComponent(branchName)}`;

        const content = await ghFetchRaw(rawUrl);

        // Prepend filename to content so it's available in search results
        // (Alchemyst SDK doesn't return metadata in search, only content)
        const fileContent = `// FILE: ${f.path}\n${content}`;
        const fileSize = Buffer.byteLength(fileContent, "utf-8");

        const finalGroupName = groupName || repo;

        /* 5️⃣ Ingest with body_metadata (not just metadata) */
        await alchemyst.v1.context.add({
          documents: [
            {
              content: fileContent,
            },
          ],
          context_type: 'resource',
          source: 'github',
          scope: 'internal',
          metadata: {
            fileName: f.path,
            fileType: 'code',
            lastModified: new Date().toISOString(),
            fileSize: fileSize,
            groupName: [finalGroupName], // Array format
          },
        });

        console.log(`✅ Ingested: ${f.path} (group: ${finalGroupName})`);
        successCount++;

      } catch (err: any) {
        console.error(`❌ Failed to ingest ${f.path}:`, err.message);
        errors.push(`${f.path}: ${err.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      groupName: groupName || repo,
      totalFiles: files.length,
      filesProcessed: successCount,
      filesSkipped: Math.max(0, files.length - maxFiles),
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (e: any) {
    console.error("Ingestion error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}
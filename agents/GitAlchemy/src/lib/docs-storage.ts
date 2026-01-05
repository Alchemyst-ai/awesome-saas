import { promises as fs } from 'fs';
import path from 'path';

// Cache directory for storing documentation
const DOCS_CACHE_DIR = path.join(process.cwd(), '.docs-cache');

interface DocumentationContent {
    [key: string]: string | null;
}

interface StoredDocs {
    owner: string;
    repo: string;
    documentation: DocumentationContent;
    updatedAt: string;
}

// Ensure cache directory exists
async function ensureCacheDir() {
    try {
        await fs.access(DOCS_CACHE_DIR);
    } catch {
        await fs.mkdir(DOCS_CACHE_DIR, { recursive: true });
    }
}

// Get the file path for a repo's documentation
function getDocsPath(owner: string, repo: string): string {
    const safeOwner = owner.replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeRepo = repo.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(DOCS_CACHE_DIR, `${safeOwner}_${safeRepo}.json`);
}

// Get stored documentation for a repo
export async function getStoredDocs(owner: string, repo: string): Promise<DocumentationContent | null> {
    try {
        await ensureCacheDir();
        const filePath = getDocsPath(owner, repo);
        const data = await fs.readFile(filePath, 'utf-8');
        const stored: StoredDocs = JSON.parse(data);
        return stored.documentation;
    } catch (error) {
        // File doesn't exist or is invalid
        return null;
    }
}

// Save documentation for a repo
export async function saveStoredDocs(owner: string, repo: string, documentation: DocumentationContent): Promise<void> {
    await ensureCacheDir();
    const filePath = getDocsPath(owner, repo);
    const stored: StoredDocs = {
        owner,
        repo,
        documentation,
        updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(filePath, JSON.stringify(stored, null, 2), 'utf-8');
}

// Update a single section of documentation
export async function updateStoredSection(owner: string, repo: string, section: string, content: string): Promise<void> {
    const existing = await getStoredDocs(owner, repo) || {};
    existing[section] = content;
    await saveStoredDocs(owner, repo, existing);
}

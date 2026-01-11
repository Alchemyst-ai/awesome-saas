import { getSupabase } from './supabase';

interface DocumentationContent {
    [key: string]: string | null;
}

// Get stored documentation for a repo (all sections)
export async function getStoredDocs(owner: string, repo: string): Promise<DocumentationContent | null> {
    try {
        const { data, error } = await getSupabase()
            .from('documentation')
            .select('section, content')
            .eq('owner', owner.toLowerCase())
            .eq('repo', repo.toLowerCase());

        if (error) {
            console.error('Supabase error fetching docs:', error);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Convert array of sections to object
        const documentation: DocumentationContent = {};
        for (const row of data) {
            documentation[row.section] = row.content;
        }

        return documentation;
    } catch (error) {
        console.error('Error fetching docs from Supabase:', error);
        return null;
    }
}

// Get a single section of documentation
export async function getStoredSection(owner: string, repo: string, section: string): Promise<string | null> {
    try {
        const { data, error } = await getSupabase()
            .from('documentation')
            .select('content')
            .eq('owner', owner.toLowerCase())
            .eq('repo', repo.toLowerCase())
            .eq('section', section)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found
                return null;
            }
            console.error('Supabase error fetching section:', error);
            return null;
        }

        return data?.content || null;
    } catch (error) {
        console.error('Error fetching section from Supabase:', error);
        return null;
    }
}

// Save or update a section of documentation
export async function updateStoredSection(
    owner: string,
    repo: string,
    section: string,
    content: string,
    sources?: string[]
): Promise<void> {
    try {
        const { error } = await getSupabase()
            .from('documentation')
            .upsert({
                owner: owner.toLowerCase(),
                repo: repo.toLowerCase(),
                section,
                content,
                sources: sources || [],
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'owner,repo,section',
            });

        if (error) {
            console.error('Supabase error saving section:', error);
            throw error;
        }

        console.log(`✅ Saved section "${section}" for ${owner}/${repo} to Supabase`);
    } catch (error) {
        console.error('Error saving section to Supabase:', error);
        throw error;
    }
}

// Save all documentation for a repo (batch save)
export async function saveStoredDocs(
    owner: string,
    repo: string,
    documentation: DocumentationContent
): Promise<void> {
    try {
        const rows = Object.entries(documentation).map(([section, content]) => ({
            owner: owner.toLowerCase(),
            repo: repo.toLowerCase(),
            section,
            content,
            updated_at: new Date().toISOString(),
        }));

        const { error } = await getSupabase()
            .from('documentation')
            .upsert(rows, {
                onConflict: 'owner,repo,section',
            });

        if (error) {
            console.error('Supabase error saving docs:', error);
            throw error;
        }

        console.log(`✅ Saved ${rows.length} sections for ${owner}/${repo} to Supabase`);
    } catch (error) {
        console.error('Error saving docs to Supabase:', error);
        throw error;
    }
}

// Check if a repo has any documentation stored
export async function hasStoredDocs(owner: string, repo: string): Promise<boolean> {
    try {
        const { count, error } = await getSupabase()
            .from('documentation')
            .select('*', { count: 'exact', head: true })
            .eq('owner', owner.toLowerCase())
            .eq('repo', repo.toLowerCase());

        if (error) {
            console.error('Supabase error checking docs:', error);
            return false;
        }

        return (count || 0) > 0;
    } catch (error) {
        console.error('Error checking docs in Supabase:', error);
        return false;
    }
}

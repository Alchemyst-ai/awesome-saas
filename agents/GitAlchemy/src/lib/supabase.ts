import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client with service role key (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions for our documentation table
export interface DocumentationRow {
    id: string;
    owner: string;
    repo: string;
    section: string;
    content: string | null;
    sources: string[] | null;
    created_at: string;
    updated_at: string;
}

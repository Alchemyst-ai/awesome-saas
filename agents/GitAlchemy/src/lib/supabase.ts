import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialize Supabase client to avoid build-time errors
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.');
        }

        _supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return _supabase;
}

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

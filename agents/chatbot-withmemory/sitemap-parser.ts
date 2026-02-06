import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

export interface NavigationEntry {
  url: string;
  slug: string;
  section: string;
  title: string;
  lastmod: string | null;
  priority: string;
}

interface SitemapUrl {
  loc?: string;
  lastmod?: string;
  priority?: string;
}

interface ParsedSitemap {
  urlset?: {
    url?: SitemapUrl | SitemapUrl[];
  };
}

/**
 * Search navigation entries by query
 */
export function searchNavigation(navigation: NavigationEntry[], query: string): NavigationEntry[] {
  const lowerQuery = query.toLowerCase();
  
  return navigation
    .filter(entry => {
      return (
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.slug.toLowerCase().includes(lowerQuery) ||
        entry.section.toLowerCase().includes(lowerQuery) ||
        entry.url.toLowerCase().includes(lowerQuery)
      );
    })
    .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority))
    .slice(0, 5);
}

/**
 * Load and cache sitemap navigation
 */
let cachedNavigation: NavigationEntry[] | null = null;

// export async function getNavigation(): Promise<NavigationEntry[]> {
//   if (cachedNavigation) return cachedNavigation;
  
//   const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
  
//   // cachedNavigation;
//   // return cachedNavigation;
// }


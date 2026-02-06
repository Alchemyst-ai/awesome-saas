import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
/**
 * Parse sitemap.xml and create a searchable navigation structure
 */
export async function parseSitemap(sitemapPath) {
    try {
        const xmlContent = await fs.readFile(sitemapPath, 'utf-8');
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
        const result = parser.parse(xmlContent);
        const urlData = result.urlset?.url;
        const urls = Array.isArray(urlData) ? urlData : urlData ? [urlData] : [];
        // Transform to navigation structure
        const navigation = urls.map(entry => {
            const loc = entry.loc || '';
            const parts = loc.split('/').filter(Boolean);
            const slug = parts[parts.length - 1] || 'home';
            return {
                url: loc,
                slug,
                section: parts.length > 3 ? parts[parts.length - 2] : 'root',
                title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                lastmod: entry.lastmod || null,
                priority: entry.priority || '0.5',
            };
        });
        return navigation;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error parsing sitemap:', message);
        return [];
    }
}
/**
 * Search navigation entries by query
 */
export function searchNavigation(navigation, query) {
    const lowerQuery = query.toLowerCase();
    return navigation
        .filter(entry => {
        return (entry.title.toLowerCase().includes(lowerQuery) ||
            entry.slug.toLowerCase().includes(lowerQuery) ||
            entry.section.toLowerCase().includes(lowerQuery) ||
            entry.url.toLowerCase().includes(lowerQuery));
    })
        .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority))
        .slice(0, 5);
}
/**
 * Load and cache sitemap navigation
 */
let cachedNavigation = null;
export async function getNavigation() {
    if (cachedNavigation)
        return cachedNavigation;
    const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
    cachedNavigation = await parseSitemap(sitemapPath);
    return cachedNavigation;
}
//# sourceMappingURL=sitemap-parser.js.map
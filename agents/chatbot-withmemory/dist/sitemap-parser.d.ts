export interface NavigationEntry {
    url: string;
    slug: string;
    section: string;
    title: string;
    lastmod: string | null;
    priority: string;
}
/**
 * Parse sitemap.xml and create a searchable navigation structure
 */
export declare function parseSitemap(sitemapPath: string): Promise<NavigationEntry[]>;
/**
 * Search navigation entries by query
 */
export declare function searchNavigation(navigation: NavigationEntry[], query: string): NavigationEntry[];
export declare function getNavigation(): Promise<NavigationEntry[]>;
//# sourceMappingURL=sitemap-parser.d.ts.map
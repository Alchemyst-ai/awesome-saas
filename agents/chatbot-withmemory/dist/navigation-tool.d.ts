interface NavigationLink {
    title: string;
    url: string;
    section: string;
}
interface NavigationResult {
    type: 'navigation' | 'no_results' | 'sections' | 'error';
    primary?: NavigationLink;
    alternates?: NavigationLink[];
    sections?: string[];
    suggestions?: NavigationLink[];
    message: string;
}
/**
 * Custom tool for navigating Razorpay documentation
 */
export declare const razorpayNavigationTool: import("ai").Tool<{
    query: string;
    intent?: "search" | "navigate" | "list" | undefined;
}, NavigationResult>;
export {};
//# sourceMappingURL=navigation-tool.d.ts.map
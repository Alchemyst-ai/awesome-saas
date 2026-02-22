import TeX from "@matejmazur/react-katex";
import {
    CopyCheckIcon,
    CopyIcon,
} from "lucide-react";
// import 'katex/dist/katex.min.css';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import Markdown, { RuleType } from "markdown-to-jsx";
import { useState, useEffect, useId } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from "mermaid";

// Mermaid Diagram Component
function MermaidDiagram({ chart, isDark }: { chart: string; isDark: boolean }) {
    const id = useId().replace(/:/g, "mermaid");
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize mermaid with theme settings
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? "dark" : "default",
            securityLevel: "loose",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
        });

        const renderChart = async () => {
            try {
                // Clear any previous error
                setError(null);

                // Render the mermaid diagram
                const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
                setSvg(renderedSvg);
            } catch (err: any) {
                console.error("Mermaid rendering error:", err);
                setError(err?.message || "Failed to render diagram");
            }
        };

        renderChart();
    }, [chart, isDark, id]);

    if (error) {
        return (
            <div className="my-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
                <p className="font-medium">Failed to render diagram</p>
                <pre className="mt-2 text-xs opacity-70 whitespace-pre-wrap">{chart}</pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="my-4 p-4 rounded-lg bg-muted animate-pulse flex items-center justify-center min-h-[100px]">
                <span className="text-muted-foreground text-sm">Rendering diagram...</span>
            </div>
        );
    }

    return (
        <div
            className="my-4 p-4 rounded-lg bg-card border border-border overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

interface MarkdownRenderProps {
    children?: string;
    [key: string]: any;
}

const reconstructFromInputs = (
    tableHeaders: any[][],
    tableCells: any[][][],
) => {
    // Helper function to clean text by removing extra spaces and concatenating text properties
    const cleanText = (textArray: any[]) => {
        return textArray
            .map((item) => item.text)
            .join("")
            .trim();
    };

    // Process headers and cells
    const processedHeaders = tableHeaders.map((header) => cleanText(header));
    const processedCells = tableCells.map((row) =>
        row.map((cell) => cleanText(cell)),
    );

    // Initialize markdown table string
    let markdownTable = "";

    // Add header row (Feature, OpenAI, Anthropic)
    markdownTable += "| " + processedHeaders.join(" | ") + " |\n";

    // Add separator row with alignment dashes
    markdownTable += "|" + processedHeaders.map(() => " --- ").join("|") + "|\n";

    // Add data rows
    // Note: processedCells array contains arrays where each inner array represents a row category
    // We need to transpose this to get proper column alignment
    for (let rowIndex = 0; rowIndex < processedCells.length; rowIndex++) {
        const rowData = [
            processedCells[rowIndex][0], // Feature name (e.g., "Founded")
            processedCells[rowIndex][1], // OpenAI value
            processedCells[rowIndex][2], // Anthropic value
        ];
        markdownTable += "| " + rowData.join(" | ") + " |\n";
    }

    return markdownTable;
};

function MarkdownRender(props: MarkdownRenderProps) {
    const [copyState, setCopyState] = useState<"copied" | "not_copied">(
        "not_copied",
    );
    const { theme } = useTheme();

    // Determine if we should use dark theme
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    return (
        <Markdown
            // children={props.children ?? ""}
            options={{
                overrides: {
                    // table: {
                    // 	component: ({ children }) => (
                    // 		<div className="overflow-x-auto my-2">
                    // 			<table
                    // 				style={{
                    // 					borderCollapse: "collapse",
                    // 					width: "100%",
                    // 					minWidth: "400px",
                    // 				}}
                    // 			>
                    // 				{children}
                    // 			</table>
                    // 		</div>
                    // 	),
                    // },
                    th: {
                        component: ({ children }: any) => (
                            <th
                                style={{
                                    borderBottom: "2px solid rgba(128,128,128,0.2)",
                                    padding: "8px 16px",
                                    textAlign: "left",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {children}
                            </th>
                        ),
                    },
                    td: {
                        component: ({ children }: any) => (
                            <td
                                style={{
                                    borderBottom: "1px solid rgba(128,128,128,0.2)",
                                    padding: "8px 16px",
                                    textAlign: "left",
                                }}
                            >
                                {children}
                            </td>
                        ),
                    },
                },
                renderRule(next: any, node: any, renderChildren: any, state: any) {
                    if (node.type === RuleType.link) {
                        return (
                            <a
                                href={node.target}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
                            >
                                <Badge variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600">
                                    {renderChildren(node.children, state)}
                                </Badge>
                            </a>
                        );
                    }
                    if (node.type === RuleType.table) {
                        return (
                            <div className="flex flex-row justify-between">
                                <div className="overflow-x-auto my-2">
                                    <table
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            minWidth: "40vw",
                                        }}
                                    >
                                        {next()}
                                    </table>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-3 w-4 p-0 bg-transparent hover:bg-transparent"
                                    onClick={() => {
                                        setCopyState("copied");
                                        navigator.clipboard.writeText(
                                            reconstructFromInputs(node.header, node.cells),
                                        );
                                        setTimeout(() => {
                                            setCopyState("not_copied");
                                        }, 500);
                                    }}
                                >
                                    {copyState === "copied" && <CopyCheckIcon className="h-2 w-2" />}
                                    {copyState === "not_copied" && <CopyIcon className="h-2 w-2" />}
                                </Button>
                            </div>
                        );
                    }
                    // Handle mermaid diagrams
                    if (node.type === RuleType.codeBlock && node.lang === "mermaid") {
                        return (
                            <MermaidDiagram
                                key={state.key}
                                chart={node.text}
                                isDark={isDark}
                            />
                        );
                    }
                    if (node.type === RuleType.codeBlock && node.lang === "latex") {
                        return (
                            <div className="flex flex-row text-lg w-full justify-between">
                                <TeX
                                    as="div"
                                    key={state.key}
                                    className="overflow-auto max-h-[20vh] min-h-[5vh]"
                                >
                                    {node.text}
                                </TeX>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-3 w-4 p-0 bg-transparent hover:bg-transparent"
                                    onClick={() => {
                                        setCopyState("copied");
                                        navigator.clipboard.writeText(node.text);
                                        setTimeout(() => {
                                            setCopyState("not_copied");
                                        }, 500);
                                    }}
                                >
                                    {copyState === "copied" && <CopyCheckIcon className="h-2 w-2" />}
                                    {copyState === "not_copied" && <CopyIcon className="h-2 w-2" />}
                                </Button>
                            </div>
                        );
                    } else if (
                        [
                            RuleType.codeBlock,
                            RuleType.codeInline,
                        ].includes(node.type as never)
                    ) {
                        if (node.type === RuleType.codeInline) {
                            return (
                                <span
                                    className="font-mono rounded px-1 text-secondary-foreground"
                                >
                                    {node.text}
                                </span>
                            );
                        }
                        return (
                            <div className="relative max-w-[45vw] min-h-[40vh] max-h-[80vh] my-2 chat-message">
                                {node.type === RuleType.codeBlock && (
                                    <div className="relative">
                                        <SyntaxHighlighter
                                            language={node.lang || 'text'}
                                            style={isDark ? oneDark : oneLight}
                                            customStyle={{
                                                margin: 0,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                maxHeight: '62vh',
                                                overflow: 'auto',
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                }
                                            }}
                                        >
                                            {node.text || (typeof next === 'function' ? next() : '')}
                                        </SyntaxHighlighter>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-3 w-4 p-0 bg-transparent hover:bg-transparent"
                                            onClick={() => {
                                                setCopyState("copied");
                                                navigator.clipboard.writeText(node.text || '');
                                                setTimeout(() => {
                                                    setCopyState("not_copied");
                                                }, 500);
                                            }}
                                        >
                                            {copyState === "copied" && <CopyCheckIcon className="h-2 w-2" />}
                                            {copyState === "not_copied" && <CopyIcon className="h-2 w-2" />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    } else if (node.type === RuleType.image) {
                        return (
                            <span className="inline-block max-w-full">
                                <img
                                    src={node.target}
                                    alt={node.alt}
                                    style={{ maxWidth: "100%", height: "auto" }}
                                />
                            </span>
                        );
                    } else if (node.type === RuleType.heading) {
                        const variant = `h${node.level}` as
                            | "h1"
                            | "h2"
                            | "h3"
                            | "h4"
                            | "h5"
                            | "h6";
                        const HeadingComponent = variant;
                        return (
                            <HeadingComponent className="mb-2">
                                {renderChildren(node.children, state)}
                            </HeadingComponent>
                        );
                    } else if (node.type === RuleType.paragraph) {
                        return (
                            <p className="my-1">
                                {renderChildren(node.children, state)}
                            </p>
                        );
                    } else if (
                        node.type === RuleType.unorderedList ||
                        node.type === RuleType.orderedList
                    ) {
                        const ListComponent = node.type === RuleType.unorderedList ? "ul" : "ol";
                        return (
                            <ListComponent
                                className="pl-6 my-2"
                                style={{
                                    listStyleType:
                                        node.type === RuleType.unorderedList ? "disc" : "decimal",
                                    listStylePosition: "outside",
                                }}
                            >
                                {node.items.map((item: any, index: number) => (
                                    <li key={`${state.key}-item-${index}`} className="mb-1">
                                        {renderChildren(item, state)}
                                    </li>
                                ))}
                            </ListComponent>
                        );
                    }

                    // return (
                    // 	<span className="chat-message">
                    // 		{next()}
                    // 	</span>
                    // );

                    return next();
                },
            }}
        >
            {props.children}
        </Markdown>
    );
}

export default MarkdownRender;

export function MarkdownRenderTest() {
    return (
        <MarkdownRender>
            {"## Some important formula:\n\n```latex\n \\N = \\dfrac{1}{2}\n```\n"}
        </MarkdownRender>
    );
}

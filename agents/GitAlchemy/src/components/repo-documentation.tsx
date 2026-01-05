"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FlaskConical,
  ChevronRight,
  FileText,
  GitBranch,
  Share2,
  Star,
  ExternalLink,
  Menu,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChatInputBar } from "@/components/chat-input-bar"
import { cn } from "@/lib/utils"

interface RepoDocumentationProps {
  owner: string
  repo: string
  initialDocs?: DocumentationContent
}

interface DocumentationContent {
  [key: string]: string | null
}

const sidebarSections = [
  {
    title: "Overview",
    icon: FileText,
    items: [
      { name: "Introduction", href: "#introduction", key: "introduction" },
      { name: "Quick Start", href: "#quick-start", key: "quick-start" },
      { name: "Architecture", href: "#architecture", key: "architecture" },
    ],
  },
]

export function RepoDocumentation({ owner, repo, initialDocs = {} }: RepoDocumentationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(["Overview"])
  // Initialize with server-provided docs (instant load, no flicker!)
  const [documentation, setDocumentation] = useState<DocumentationContent>(initialDocs)
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set())

  // Save section to server after generating
  const saveToServer = async (section: string, content: string) => {
    try {
      await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, section, content }),
      })
    } catch (error) {
      console.error("Failed to save to server:", error)
    }
  }

  // Fetch documentation for a section
  const fetchSection = async (sectionKey: string) => {
    // Check if already loaded
    if (documentation[sectionKey] !== undefined && documentation[sectionKey] !== null) {
      return
    }

    setLoadingSections((prev) => new Set(prev).add(sectionKey))

    try {
      const response = await fetch("/api/generate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          section: sectionKey,
          groupName: repo,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setDocumentation((prev) => ({
          ...prev,
          [sectionKey]: data.content,
        }))
        // Save to server for persistence
        saveToServer(sectionKey, data.content)
      } else {
        const errorContent = `**Error:** ${data.error}\n\nThis section couldn't be generated. The repository may not be fully ingested yet.`
        setDocumentation((prev) => ({
          ...prev,
          [sectionKey]: errorContent,
        }))
      }
    } catch (error: any) {
      console.error(`Error fetching ${sectionKey}:`, error)
      setDocumentation((prev) => ({
        ...prev,
        [sectionKey]: `**Error loading content:** ${error.message}`,
      }))
    } finally {
      setLoadingSections((prev) => {
        const next = new Set(prev)
        next.delete(sectionKey)
        return next
      })
    }
  }

  // Auto-fetch sections that aren't loaded yet
  useEffect(() => {
    const sections = ["introduction", "quick-start", "architecture"]
    sections.forEach((section) => {
      if (!documentation[section]) {
        fetchSection(section)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSection = (title: string) => {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  const renderSectionContent = (sectionKey: string) => {
    const content = documentation[sectionKey]
    const isLoading = loadingSections.has(sectionKey)

    if (isLoading) {
      return (
        <div className="flex items-center gap-3 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Generating documentation...</span>
        </div>
      )
    }

    if (content === null || content === undefined) {
      return (
        <button
          onClick={() => fetchSection(sectionKey)}
          className="text-sm text-primary hover:underline font-medium"
        >
          Click to generate documentation
        </button>
      )
    }

    // Render markdown-like content with better styling
    const formatMarkdown = (text: string): string => {
      let formatted = text

      // Code blocks first (before inline code)
      formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 border border-border"><code class="text-sm font-mono text-foreground">${code.trim()}</code></pre>`
      })

      // Headers
      formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
      formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4 text-foreground">$1</h2>')
      formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h1>')

      // Bold and italic
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

      // Inline code (after code blocks)
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">$1</code>')

      // Lists
      formatted = formatted.replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
      formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 mb-2 list-decimal">$2</li>')

      // Paragraphs (split by double newlines)
      const paragraphs = formatted.split(/\n\n+/)
      formatted = paragraphs
        .filter(p => p.trim())
        .map(p => {
          // Don't wrap if it's already a block element
          if (p.trim().startsWith('<')) {
            return p
          }
          return `<p class="mb-4 text-foreground/90 leading-relaxed">${p.trim()}</p>`
        })
        .join('')

      return formatted
    }

    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div
          className="text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatMarkdown(content)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FlaskConical className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">GitAlchemy</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Repo info */}
          <div className="border-b border-sidebar-border p-4">
            <Link
              href={`/${owner}/${repo}`}
              className="flex items-center gap-2 text-sm text-sidebar-foreground hover:text-sidebar-foreground/80 transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">
                {owner}/{repo}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {sidebarSections.map((section) => (
                <Collapsible
                  key={section.title}
                  open={openSections.includes(section.title)}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSections.includes(section.title) && "rotate-90",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-sidebar-border pl-4">
                      {section.items.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault()
                            if (documentation[item.key] === undefined) {
                              fetchSection(item.key)
                            }
                            // Smooth scroll to section
                            const element = document.querySelector(item.href)
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {owner}/{repo}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://github.com/${owner}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </header>

        {/* Documentation content */}
        <main className="flex-1 overflow-auto pb-20">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Introduction */}
            <section id="introduction" className="mb-20 scroll-mt-20">
              <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Introduction</h2>
              <div className="text-foreground/90">
                {renderSectionContent("introduction")}
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="mb-20 scroll-mt-20">
              <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Quick Start</h2>
              <div className="text-foreground/90">
                {renderSectionContent("quick-start")}
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="mb-20 scroll-mt-20">
              <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Architecture</h2>
              <div className="text-foreground/90">
                {renderSectionContent("architecture")}
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Chat Input Bar */}
      <ChatInputBar owner={owner} repo={repo} />
    </div>
  )
}
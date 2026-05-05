"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FlaskConical,
  GitBranch,
  Send,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Zap,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import MarkdownRender from "@/components/markdown-render"

interface RepoChatProps {
  owner: string
  repo: string
  initialQuery?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

export function RepoChat({ owner, repo, initialQuery }: RepoChatProps) {
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
  const router = useRouter()
  const storageKey = `gitalchemy-chat-${owner}-${repo}`

  // Load chat history from sessionStorage on mount (clears when tab closes)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setChatMessages(parsed)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
    setIsHistoryLoaded(true)
  }, [storageKey])

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    if (isHistoryLoaded && chatMessages.length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(chatMessages))
      } catch (error) {
        console.error("Error saving chat history:", error)
      }
    }
  }, [chatMessages, storageKey, isHistoryLoaded])

  // Auto-submit only if initialQuery is provided AND chat is empty
  // Don't re-submit on refresh if there are already messages
  useEffect(() => {
    if (isHistoryLoaded && initialQuery && !chatLoading && chatMessages.length === 0) {
      handleSendMessage(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, isHistoryLoaded])

  const handleClearChat = () => {
    setChatMessages([])
    try {
      sessionStorage.removeItem(storageKey)
    } catch (error) {
      console.error("Error clearing chat history:", error)
    }
    setShowClearConfirm(false)
  }

  const handleSendMessage = async (queryOrEvent: string | React.FormEvent) => {
    // Handle both form submission and direct query
    let userMessage: string
    if (typeof queryOrEvent === 'string') {
      userMessage = queryOrEvent.trim()
    } else {
      queryOrEvent.preventDefault()
      if (!message.trim() || chatLoading) return
      userMessage = message.trim()
      setMessage("")
    }

    if (!userMessage || chatLoading) return
    setChatLoading(true)

    // Add user message at the beginning (newest first)
    const userMsg: ChatMessage = { role: "user", content: userMessage }
    const newMessages: ChatMessage[] = [userMsg, ...chatMessages]
    setChatMessages(newMessages)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          groupName: repo,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        // Add assistant response at the beginning (after user message)
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        }
        setChatMessages([assistantMsg, userMsg, ...chatMessages])
      } else {
        setChatMessages([{ role: "assistant", content: `**Error:** ${data.error}` }, userMsg, ...chatMessages])
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      setChatMessages([{ role: "assistant", content: `**Error:** ${error.message}` }, userMsg, ...chatMessages])
    } finally {
      setChatLoading(false)
    }
  }

  const renderChatMessage = (msg: ChatMessage, idx: number) => {
    return (
      <div key={idx} className="mb-6">
        <div className={cn(
          "flex gap-4",
          msg.role === "user" ? "justify-end" : "justify-start"
        )}>
          <div className={cn(
            "max-w-[85%] rounded-xl p-4 shadow-sm",
            msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-card-foreground"
          )}>
            <div className="text-sm leading-relaxed">
              {msg.role === "user" ? (
                <span className="break-words">{msg.content}</span>
              ) : (
                <MarkdownRender>{msg.content}</MarkdownRender>
              )}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-medium mb-2 opacity-75">Sources:</p>
                <div className="flex flex-wrap gap-1.5">
                  {msg.sources.slice(0, 5).map((source, i) => (
                    <span
                      key={i}
                      className="text-xs bg-background/30 dark:bg-background/20 px-2 py-1 rounded-md border border-border/50"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${owner}/${repo}`)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">GitAlchemy</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span className="font-medium">
              {owner}/{repo}
            </span>
          </div>
        </div>
        {chatMessages.length > 0 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-destructive/10 px-3 py-2 rounded-lg">
                <span className="text-sm text-destructive">Clear chat?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClearChat}
                  className="h-7"
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClearConfirm(false)}
                  className="h-7"
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Chat content */}
      <main className="flex-1 overflow-hidden flex flex-col pb-20">
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {!isHistoryLoaded ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  Ask anything about {owner}/{repo}
                </h2>
                <p className="mb-8 max-w-md text-muted-foreground">
                  Get answers about the codebase, architecture, functions, and more.
                  I'll search through the repository to provide accurate information.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg w-full">
                  <button
                    onClick={() => setMessage("What is this repository about?")}
                    className="rounded-lg border border-border bg-card p-4 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground mb-1">What is this repository about?</div>
                    <div className="text-xs text-muted-foreground">Get an overview of the project</div>
                  </button>
                  <button
                    onClick={() => setMessage("How do I get started?")}
                    className="rounded-lg border border-border bg-card p-4 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground mb-1">How do I get started?</div>
                    <div className="text-xs text-muted-foreground">Installation and setup guide</div>
                  </button>
                  <button
                    onClick={() => setMessage("What are the main components?")}
                    className="rounded-lg border border-border bg-card p-4 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground mb-1">What are the main components?</div>
                    <div className="text-xs text-muted-foreground">Explore the architecture</div>
                  </button>
                  <button
                    onClick={() => setMessage("Show me example code")}
                    className="rounded-lg border border-border bg-card p-4 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground mb-1">Show me example code</div>
                    <div className="text-xs text-muted-foreground">See code examples</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                {chatMessages.map((msg, idx) => renderChatMessage(msg, idx))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat input bar - matching DeepWiki style */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">

              {/* Input field */}
              <Input
                type="text"
                placeholder="Ask a follow-up question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={chatLoading}
                className="flex-1 h-12 bg-card border-border text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
              />

              {/* Send button */}
              <Button
                type="submit"
                size="icon"
                disabled={chatLoading || !message.trim()}
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {chatLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div >
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputBarProps {
  owner: string
  repo: string
}

export function ChatInputBar({ owner, repo }: ChatInputBarProps) {
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const query = encodeURIComponent(message.trim())
    setMessage("") // Clear input after submission
    router.push(`/${owner}/${repo}/chat?q=${query}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">

          {/* Input field */}
          <Input
            type="text"
            placeholder={`Ask about ${owner}/${repo}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 h-12 bg-card border-border text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
          />

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim()}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}


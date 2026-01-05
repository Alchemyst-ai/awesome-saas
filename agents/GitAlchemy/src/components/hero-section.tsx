"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, FlaskConical, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const [repoUrl, setRepoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Normalize the repo URL
      let normalizedUrl = repoUrl.trim()
      if (!normalizedUrl.includes("github.com") && !normalizedUrl.includes("/")) {
        setError("Invalid format. Use owner/repo or https://github.com/owner/repo")
        setLoading(false)
        return
      }

      // If it's just owner/repo, convert to full URL for parsing
      if (!normalizedUrl.startsWith("http")) {
        normalizedUrl = `https://github.com/${normalizedUrl}`
      }

      // Call the ingest API
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: normalizedUrl,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || "Failed to ingest repository")
      }

      // Extract owner and repo from the URL for navigation
      const urlObj = new URL(normalizedUrl)
      const [owner, repo] = urlObj.pathname.replace(/^\/+/, "").split("/").slice(0, 2)

      // Navigate to the repo documentation page
      router.push(`/${owner}/${repo}`)
    } catch (err: any) {
      console.error("Error ingesting repo:", err)
      setError(err.message || "Failed to process repository. Please try again.")
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-chart-2/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <FlaskConical className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">GitAlchemy</h1>
        </div>

        {/* Tagline */}
        <p className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Transform code into knowledge with AI</span>
        </p>

        {/* Main heading */}
        <h2 className="mb-12 text-balance text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
          Which repo would you like to understand?
        </h2>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="owner/repository or https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  className="h-14 rounded-xl border-border bg-card pl-12 pr-4 text-base text-card-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 rounded-xl px-6 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add repo"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive text-left px-1">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
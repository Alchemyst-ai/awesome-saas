"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Props = {
  onGenerated: (data: { subject: string; shortBody: string; longBody: string; cta: string }) => void
}

export default function NewsletterForm({ onGenerated }: Props) {
  const [companyName, setCompanyName] = useState("")
  const [audience, setAudience] = useState("")
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("Professional")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/json") {
        setError("Please upload a JSON file")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  function removeFile() {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!companyName.trim() || !audience.trim() || !topic.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (!file) {
      setError("Please upload a JSON context file")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("companyName", companyName.trim())
      formData.append("audience", audience.trim())
      formData.append("topic", topic.trim())
      formData.append("tone", tone)
      formData.append("file", file)

      const res = await fetch("/api/newsletter", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate newsletter")
      }

      const data = await res.json()
      onGenerated(data.newsletter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate newsletter")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="companyName">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="companyName"
          placeholder="e.g., TechCorp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="audience">
          Target Audience <span className="text-destructive">*</span>
        </Label>
        <Input
          id="audience"
          placeholder="e.g., Startup founders, CTOs"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="topic">
          Newsletter Topic <span className="text-destructive">*</span>
        </Label>
        <Input
          id="topic"
          placeholder="e.g., AI product launches, Industry trends"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tone">Tone</Label>
        <Select value={tone} onValueChange={setTone} disabled={isLoading}>
          <SelectTrigger id="tone" aria-label="Choose tone">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Friendly">Friendly</SelectItem>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Witty">Witty</SelectItem>
            <SelectItem value="Inspirational">Inspirational</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="file">
          Context File (JSON) <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="sr-only"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? "Change File" : "Upload JSON File"}
          </Button>
        </div>
        {file && (
          <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
            <span className="text-sm truncate">{file.name}</span>
            <Button type="button" variant="ghost" size="sm" onClick={removeFile} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Newsletter...
          </>
        ) : (
          "Generate Newsletter"
        )}
      </Button>
    </form>
  )
}

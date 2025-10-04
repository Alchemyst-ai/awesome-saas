"use client"

import { Button } from "@/components/ui/button"
import { newsletterToHTML, newsletterToMarkdown } from "@/lib/export"
import type { EditorValue } from "./NewsletterEditor"

type Props = {
  value: EditorValue
}

export default function ExportButtons({ value }: Props) {
  async function copyToClipboard() {
    const md = newsletterToMarkdown(value)
    await navigator.clipboard.writeText(md)
  }

  function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function exportHTML() {
    const html = newsletterToHTML(value)
    downloadFile("newsletter.html", html, "text/html;charset=utf-8")
  }

  function exportMarkdown() {
    const md = newsletterToMarkdown(value)
    downloadFile("newsletter.md", md, "text/markdown;charset=utf-8")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" type="button" onClick={copyToClipboard} aria-label="Copy markdown to clipboard">
        Copy to Clipboard
      </Button>
      <Button type="button" onClick={exportHTML} aria-label="Export as HTML">
        Export HTML
      </Button>
      <Button type="button" onClick={exportMarkdown} aria-label="Export as Markdown">
        Export Markdown
      </Button>
    </div>
  )
}

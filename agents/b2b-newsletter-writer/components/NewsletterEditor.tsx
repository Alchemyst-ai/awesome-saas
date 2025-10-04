"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type EditorValue = {
  subject: string
  shortBody: string
  longBody: string
  cta: string
}

type Props = {
  value: EditorValue
  onChange: (v: EditorValue) => void
}

export default function NewsletterEditor({ value, onChange }: Props) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">Short Body</Label>
        <Textarea
          id="body"
          className="min-h-[220px]"
          value={value.shortBody}
          onChange={(e) => onChange({ ...value, shortBody: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">Long Body</Label>
        <Textarea
          id="body"
          className="min-h-[220px]"
          value={value.longBody}
          onChange={(e) => onChange({ ...value, longBody: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cta">Call to Action</Label>
        <Input id="cta" value={value.cta} onChange={(e) => onChange({ ...value, cta: e.target.value })} />
      </div>
    </section>
  )
}

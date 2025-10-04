"use client"

import { useState } from "react"
import Header from "@/components/Header"
import NewsletterForm from "@/components/NewsletterForm"
import NewsletterEditor, { type EditorValue } from "@/components/NewsletterEditor"
import ExportButtons from "@/components/ExportButtons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function NewsletterPage() {
  const [value, setValue] = useState<EditorValue>({
    subject: "",
    shortBody: "",
    longBody: "",
    cta: "",
  })

  const hasContent = value.subject || value.shortBody || value.longBody || value.cta

  // Calculate character counts for analytics
  const subjectLength = value.subject.length
  const shortBodyLength = value.shortBody.length
  const longBodyLength = value.longBody.length

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 grid gap-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left sidebar - Form and Export */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Generate Newsletter</CardTitle>
                <CardDescription className="text-balance">
                  Fill in the details to create your AI-powered newsletter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterForm onGenerated={setValue} />
              </CardContent>
            </Card>

            {hasContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-balance">Export Options</CardTitle>
                  <CardDescription className="text-balance">Download or copy your newsletter</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExportButtons value={value} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right side - Editor and Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-balance">Newsletter Editor</CardTitle>
                    <CardDescription className="text-balance">Edit and refine your generated content</CardDescription>
                  </div>
                  {hasContent && (
                    <div className="flex gap-2">
                      <Badge variant="secondary">Subject: {subjectLength} chars</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!hasContent ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-balance">Generate a newsletter to start editing</p>
                  </div>
                ) : (
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="mt-6">
                      <NewsletterEditor value={value} onChange={setValue} />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-6">
                      <div className="space-y-6 p-6 border rounded-lg bg-card">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Subject Line</h3>
                          <p className="text-lg font-semibold">{value.subject || "No subject"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Short Body</h3>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{value.shortBody || "No content"}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Long Body</h3>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{value.longBody || "No content"}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Call to Action</h3>
                          <p className="font-medium">{value.cta || "No CTA"}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

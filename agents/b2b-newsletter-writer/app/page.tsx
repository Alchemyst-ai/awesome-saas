import Link from "next/link"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, FileText, Download, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Newsletter Generation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Create Professional B2B Newsletters in Seconds
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Generate engaging, on-brand newsletters tailored to your audience with the power of AI. Edit, customize, and
            export in multiple formats.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/newsletter">
                <Zap className="mr-2 h-5 w-5" />
                Generate Newsletter
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-balance">AI-Powered Generation</CardTitle>
              <CardDescription className="text-balance">
                Leverage advanced AI to create compelling newsletter content tailored to your brand and audience
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-balance">Easy Editing</CardTitle>
              <CardDescription className="text-balance">
                Fine-tune every aspect of your newsletter with our intuitive editor. Full control over subject, body,
                and CTAs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-balance">Multiple Export Formats</CardTitle>
              <CardDescription className="text-balance">
                Export your newsletter as HTML, Markdown, or plain text. Copy to clipboard or download instantly
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 p-8 rounded-lg border bg-card">
          <h2 className="text-2xl font-bold mb-4 text-balance">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold">Input Details</h3>
              <p className="text-sm text-muted-foreground">
                Provide your company name, target audience, topic, and tone
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold">Upload Context</h3>
              <p className="text-sm text-muted-foreground">
                Add a JSON file with additional context about your brand or product
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold">AI Generation</h3>
              <p className="text-sm text-muted-foreground">
                Our AI creates a professional newsletter tailored to your needs
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-semibold">Edit & Export</h3>
              <p className="text-sm text-muted-foreground">Fine-tune the content and export in your preferred format</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

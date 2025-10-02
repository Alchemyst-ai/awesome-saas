import Link from "next/link"
import { FileText } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Newsletter AI</span>
        </Link>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Generate, edit, and export professional newsletters
        </p>
      </div>
    </header>
  )
}

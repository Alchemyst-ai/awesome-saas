"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CopyButton from "./Copybutton"

export const ImprovedPrompt = ({ improvedPrompt }: { improvedPrompt: string }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Card className="relative overflow-hidden border border-border bg-card">
        
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: "linear-gradient(to right, var(--color-chart-4), var(--color-chart-5))",
          }}
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center justify-between gap-2">
            <span className="text-balance">Improved Prompt</span>
            <CopyButton textToCopy={improvedPrompt} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground leading-relaxed tracking-wide text-base">{improvedPrompt}</p>
        </CardContent>
      </Card>
    </div>
  )
}

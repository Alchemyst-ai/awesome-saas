import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EvaluationDescription() {
  return (
    <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6">
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground text-center tracking-tight">
            Evaluation Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-muted-foreground text-base list-decimal list-inside leading-relaxed">
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
                <strong className="font-semibold text-foreground">Relevance:</strong> How well does the response address
                the user&rsquo;s query?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Intent Match:</strong> Does the response align with the
              user’s intent and expected outcome?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Groundedness:</strong> Is the response backed by
              verifiable facts or logical reasoning?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Fluency:</strong> Is the language smooth, natural, and
              free of grammatical errors?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Conciseness:</strong> Is the response brief yet
              informative, avoiding unnecessary repetition or fluff?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Reference Alignment:</strong> Does the response
              accurately reflect and align with any provided references or context?
            </li>
            <li className="transition-transform hover:translate-x-1 hover:text-foreground">
              <strong className="font-semibold text-foreground">Tonality:</strong> Is the tone appropriate, clear, and
              consistent with the prompt’s style?
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

import {Proportions} from "lucide-react"

export default function Header() {
    return (
        <header className="shadow-md bg-background sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 py-4 flex  items-center justify-between">
                <div className="flex items-center justify-center">

                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity h-8 w-8 rounded-lg bg-primary justify-center">
                    <Proportions className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg text-primary-foreground text-center">
                    AI Prompt Evaluator
                </span>
                </div>
                <p className="text-md text-primary-foreground hidden sm:block text-center">
                    Evaluate the quality of prompts
                </p>
            </div>
        </header>
    )
}
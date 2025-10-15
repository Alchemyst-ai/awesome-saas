"use client";

import { Proportions } from "lucide-react";

export default function Header() {
  return (
    <header className="shadow-md bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary">
            <Proportions className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl sm:text-lg text-primary-foreground text-center">
            AI Prompt Evaluator
          </span>
        </div>

        {/* Right: Tagline */}
        <p className="text-sm sm:text-base text-primary-foreground text-center sm:text-right hidden sm:block">
          Evaluate the quality of prompts
        </p>
      </div>
    </header>
  );
}

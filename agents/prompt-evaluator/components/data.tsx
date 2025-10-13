
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

interface DonutChartData {
  name: string;
  value: number;
}

export function useDonutChartData() {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData(["prompt-evaluator"]) as any;

  // Safely parse and map the data
  const chartData = useMemo(() => {
    if (!cachedData) return [];
    const evalObject = cachedData.evaluation.evaluation;

    return Object.keys(evalObject)
      .filter(
        (key) =>
          key !== "toxicity" &&
          key !== "overAllAssessment" &&
          key !== "improvementSuggestions" &&
          key !== "improvedPrompt"
      )
      .map((key) => ({
        name: key.toUpperCase(),
        value: evalObject[key].score,
      }));
  }, [cachedData]);

  const totalScore = cachedData?.evaluation.evaluation.overAllAssessment?.totalScore ?? 0;
  const summary = cachedData?.evaluation.evaluation.overAllAssessment?.summary ?? "";
  const improvedPrompt = cachedData?.evaluation.evaluation.improvedPrompt ?? "";
  const improvedSuggestions =
    cachedData?.evaluation.evaluation.improvementSuggestions
      ?.map((item: any, index: number) => `${index + 1}. ${item.issue}\n   Suggestion: ${item.suggestion}`)
      .join("\n\n") ?? "";

  return { chartData, totalScore, summary, improvedPrompt, improvedSuggestions };
}

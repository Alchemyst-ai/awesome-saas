"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";


function getChartData(evalObject: Record<string, any>) {
  const excludedKeys = [
    "toxicity",
    "overAllAssessment",
    "improvementSuggestions",
    "improvedPrompt",
  ];

  return Object.keys(evalObject)
    .filter((key) => !excludedKeys.includes(key))
    .map((key) => ({
      name: key.toUpperCase(),
      value: evalObject[key].score,
    }));
}


function formatImprovementSuggestions(suggestions: any[] = []) {
  return suggestions
    .map((item, index) => {
      const typedItem = item as { issue: string; suggestion: string };
      return `${index + 1}. ${typedItem.issue}\n   Suggestion: ${typedItem.suggestion}`;
    })
    .join("\n\n");
}

export function useDonutChartData() {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData(["prompt-evaluator"]) as any;

  const { chartData, totalScore, summary, improvedPrompt, improvedSuggestions } = useMemo(() => {
    if (!cachedData) {
      return { chartData: [], totalScore: 0, summary: "", improvedPrompt: "", improvedSuggestions: "" };
    }

    const evalObject = cachedData.evaluation.evaluation;
    const chartData = getChartData(evalObject);
    const totalScore = evalObject.overAllAssessment?.totalScore ?? 0;
    const summary = evalObject.overAllAssessment?.summary ?? "";
    const improvedPrompt = evalObject.improvedPrompt ?? "";
    const improvedSuggestions = formatImprovementSuggestions(
      evalObject.improvementSuggestions ?? []
    );

    return { chartData, totalScore, summary, improvedPrompt, improvedSuggestions };
  }, [cachedData]);

  return { chartData, totalScore, summary, improvedPrompt, improvedSuggestions };
}

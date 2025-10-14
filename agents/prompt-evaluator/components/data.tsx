"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

interface EvalScore {
  score: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ImprovementSuggestion {
  issue: string;
  suggestion: string;
}

interface OverAllAssessment {
  totalScore: number;
  summary: string;
}

interface EvaluationObject {
  toxicity?: EvalScore;
  overAllAssessment?: OverAllAssessment;
  improvementSuggestions?: ImprovementSuggestion[];
  improvedPrompt?: string;
  [key: string]: EvalScore | OverAllAssessment | ImprovementSuggestion[] | string | undefined;
}

interface CachedData {
  evaluation: {
    evaluation: EvaluationObject;
  };
}

function getChartData(evalObject: EvaluationObject): ChartDataPoint[] {
  const excludedKeys = [
    "toxicity",
    "overAllAssessment",
    "improvementSuggestions",
    "improvedPrompt",
  ];

  return Object.keys(evalObject)
    .filter((key) => !excludedKeys.includes(key))
    .map((key) => {
      const value = evalObject[key];
      const score = value && typeof value === 'object' && 'score' in value 
        ? (value as EvalScore).score 
        : 0;
      
      return {
        name: key.toUpperCase(),
        value: score,
      };
    });
}

function formatImprovementSuggestions(suggestions: ImprovementSuggestion[] = []): string {
  return suggestions
    .map((item, index) => 
      `${index + 1}. ${item.issue}\n   Suggestion: ${item.suggestion}`
    )
    .join("\n\n");
}

export function useDonutChartData() {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<CachedData>(["prompt-evaluator"]);

  const { chartData, totalScore, summary, improvedPrompt, improvedSuggestions } = useMemo(() => {
    if (!cachedData) {
      return { 
        chartData: [], 
        totalScore: 0, 
        summary: "", 
        improvedPrompt: "", 
        improvedSuggestions: "" 
      };
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
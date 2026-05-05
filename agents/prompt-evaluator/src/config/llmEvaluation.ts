import { LLM_EVALUATION_TEMPLATE } from "./llmEvaluationTemplate";


export function llmEvaluation(prompt: string, context?: string): string {
  return LLM_EVALUATION_TEMPLATE(prompt, context);
}

export interface RubrixEvaluationCriteria{
    outputQuality:{
        relevance: number;
        coherence: number;   //prompt is clear in reading and understandable
        completeness: number;
        accuracy: number;
    };

    promptQuality:{
        clarity: number;
        specificity: number;
        structure: number;
    };

    preformace:{
        latency:number;
        tokenUsage:number;
        cost:number;
    };

    improvementMetrics:{
        ambiguity:number;
        weaknessScore:number;
        improveability:number;
    }

    reliability:{
        consistency:number;
        successRate:number;
    }

}

export const EVALUATION_WEIGHTS = {
    // OUTPUT QUALITY (30%)
    relevance: 0.10,
    coherence: 0.08,
    completeness: 0.07,
    accuracy: 0.05,
    
    // PROMPT QUALITY (25%)
    clarity: 0.10,
    specificity: 0.08,
    structure: 0.07,
    
    // PERFORMANCE (20%)
    latency: 0.10,
    tokenUsage: 0.05,
    cost: 0.05,
    
    // IMPROVEMENT POTENTIAL (15%)
    ambiguity: 0.05,
    weaknessScore: 0.05,
    improveability: 0.05,
    
    // RELIABILITY (10%)
    consistency: 0.05,
    successRate: 0.05,
  };


  export interface RubrixEvaluationResult{
    promptId: string;
    originalPrompt: string;
    weaknesses: PromptWeakness[];
    ambiguities: PromptAmbiguity[];
    suggestions: ImprovementSuggestion[];
    previousImprovements: PreviousImprovement[];
    strategy: PromptStrategy;
    evaluationCriteria: RubrixEvaluationCriteria;
    strengths: string[];
    refinedPrompt: string;
  }

  export interface PromptWeakness {
    type: WeaknessType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string; // Which part of prompt
    impact: string;   // How it affects output
    fix: string;      // How to fix it
  }

  export type WeaknessType =
  | 'vague_instruction'
  | 'missing_context'
  | 'conflicting_requirements'
  | 'poor_structure'
  | 'unclear_goal'
  | 'missing_constraints'
  | 'ambiguous_terminology'
  | 'incomplete_examples'
  | 'wrong_tone'
  | 'too_broad'
  | 'too_narrow';

  export interface PromptAmbiguity {
    phrase: string;
    possibleInterpretations: string[];
    recommendedClarification: string;
    confidence: number; // How sure are we this is ambiguous
  }

  export interface ImprovementSuggestion {
    category: 'structure' | 'clarity' | 'context' | 'constraints' | 'examples';
    priority: 'high' | 'medium' | 'low';
    before?: string;
    after?: string;
    reason: string;
    expectedImpact: string;
    exampleOutput?: string;
  }

  export interface PreviousImprovement {
    originalPrompt: string;
    improvedPrompt: string;
    improvements: string[];
    scoreIncrease: number;
    timestamp: Date;
    userFeedback?: 'accepted' | 'rejected' | 'modified';
  }
  
  export type PromptStrategy =
    | 'zero_shot'
    | 'few_shot'
    | 'chain_of_thought'
    | 'step_by_step'
    | 'role_based'
    | 'structured_output'
    | 'iterative_refinement';
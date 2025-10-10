export interface EvaluationCriteria{
    groundness:{
        score: number;
        confidence: number;
        reasoning: string;
    };

    conciseness: {
        score: number;
        confidence: number;
        reasoning: string;
    };

    fluency: {
        score: number;
        confidence: number;
        reasoning: string;
    };

    referenceAlignment: {
        score: number;
        confidence: number;
        reasoning: string;
    };

    tonality: {
        score: number;
        confidence: number;
        reasoning: string;
    };

    relevance: {    //relevance and offtopic means same
        score: number;
        confidence: number;
        reasoning: string;
    };

    intentMatch:{
        score: number;
        confidence: number;
        reasoning: string;
    };

    toxicity:{
        isToxic: boolean;
        confidence: number;
        reasoning: string;
    };

    

    improvementSuggestions: PromptImprovement[];
    improvedPrompt: string;
    overAllAssessment:{
        totalScore: number;
        summary: string
    }
}

export interface PromptImprovement{
    issue: string;
    suggestion: string;
    expectedImpact: string
    priority: "low" | "medium" | "high";
};

export interface EvaluationResults{
    promptId: string;
    originalPrompt: string;
    evaluation: EvaluationCriteria;
    
}
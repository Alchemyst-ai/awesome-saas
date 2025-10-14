export interface EvaluationCriteria{
    groundness:{
        score: number;
        
    };

    conciseness: {
        score: number;
        
    };

    fluency: {
        score: number;
    };

    referenceAlignment: {
        score: number;
    };

    tonality: {
        score: number;
       
    };

    relevance: {    //relevance and offtopic means same
        score: number;
        
    };

    intentMatch:{
        score: number;
        
    };

    toxicity:{
        isToxic: boolean;
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
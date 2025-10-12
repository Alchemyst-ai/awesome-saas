//data come from backend in json formate, then converted to typescript object and used in the donut chart as uisng map function and assign to as name, value
interface Metric{
    score:number;
}
interface ToxicityMetric{
    isToxic:boolean;
    confidence:number;
}

interface OverallAssessment{
    totalScore:number;
    summary:string;
}

interface Evaluation {
    groundedness: Metric;
    conciseness: Metric;
    fluency: Metric;
    referenceAlignment: Metric;
    tonality: Metric;
    relevance: Metric;
    intentMatch: Metric;
    toxicity: ToxicityMetric;
    overAllAssessment: OverallAssessment;
  }

interface ApiResponse {
    evaluation: {
      promptId: string;
      originalPrompt: string;
      evaluation: Evaluation;
    };
}
  
interface DonutChartData {
    name: string;
    value: number;
}


const response = {
    "evaluation": {
        "promptId": "da6cfecc-cb66-4e7d-bbc8-649f88a00bbe",
        "originalPrompt": "Explain machine Learning in simple terms",
        "evaluation": {
            "groundedness": {
                "score": 4,
                "confidence": 0.9,
                
            },
            "conciseness": {
                "score": 3,
                "confidence": 0.8,
                
            },
            "fluency": {
                "score": 4,
                "confidence": 0.9,
                
            },
            "referenceAlignment": {
                "score": 5,
                "confidence": 1,
                
            },
            "tonality": {
                "score": 5,
                "confidence": 1,
                
            },
            "relevance": {
                "score": 5,
                "confidence": 1,
                
            },
            "intentMatch": {
                "score": 5,
                "confidence": 1,
                
            },
            "toxicity": {
                "isToxic": false,
                "confidence": 1,
                
            },
            "improvementSuggestions": [
                {
                    "issue": "The prompt lacks specificity regarding the target audience or the desired length of the explanation.",
                    "suggestion": "Specify the target audience (e.g., \"for a high school student\") and the approximate word count (e.g., \"in approximately 150 words\").",
                    "expectedImpact": "Improved consistency and relevance of the responses, tailored to a specific level of understanding.",
                    "priority": "medium"
                },
                {
                    "issue": "The prompt doesn't specify whether analogies or real-world examples are preferred to aid understanding.",
                    "suggestion": "Incorporate a request for analogies or real-world examples to make the explanation more accessible (e.g., \"Use analogies to explain complex concepts\").",
                    "expectedImpact": "Increased clarity and accessibility of the explanation, particularly for those unfamiliar with quantum mechanics.",
                    "priority": "medium"
                }
            ],
            "improvedPrompt": "Explain Quantum Computing in approximately 150 words, suitable for a high school student with no prior knowledge of physics. Use analogies to explain complex concepts.",
            "overAllAssessment": {
                "totalScore": 4.43,
                "summary": "The prompt is good as it is, but it could be improved by specifying the desired length and the target audience. Also, requesting analogies will improve the explanation."
            }
        }
    }
}

const evalobject = response.evaluation.evaluation

export const data: DonutChartData[] = Object.keys(evalobject)
  .filter((key) => key !== "toxicity" && key !== "overAllAssessment" && key!== "improvementSuggestions" && key !== "improvedPrompt")
  .map((key) => {
    const metric = evalobject[key as keyof Evaluation] as Metric;
    return { name: key.toLocaleUpperCase(), value: metric.score };
  });

export const totalScore = evalobject.overAllAssessment.totalScore;
export const summary = evalobject.overAllAssessment.summary;
export const improvedPrompt = evalobject.improvedPrompt;    
export const improvedSuggestions = evalobject.improvementSuggestions.map((item, index) => 
    `${index + 1}. ${item.issue}\n   Suggestion: ${item.suggestion}`
).join('\n\n');
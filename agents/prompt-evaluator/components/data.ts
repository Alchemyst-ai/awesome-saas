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
                "reasoning": "While explaining quantum computing in simple terms ideally should not require external knowledge, the field itself is complex. The response's groundedness depends on how well it simplifies established quantum concepts without introducing inaccuracies. A high score assumes a simplified, but correct, explanation based on known principles."
            },
            "conciseness": {
                "score": 3,
                "confidence": 0.8,
                "reasoning": "Conciseness depends on the level of detail used in the explanation. Explaining quantum computing requires a certain amount of detail to be accurate, so conciseness must be balanced with clarity. A satisfactory response would be detailed enough to be informative but avoid unnecessary jargon or complex equations."
            },
            "fluency": {
                "score": 4,
                "confidence": 0.9,
                "reasoning": "Fluency will be judged on how well the concepts are presented logically and intelligibly. A high score indicates the response uses clear language, avoids overly technical terms without explanation, and organizes information in a way that's easy to follow."
            },
            "referenceAlignment": {
                "score": 5,
                "confidence": 1,
                "reasoning": "The prompt is self-contained so the reference alignment is perfect. No reference context is available."
            },
            "tonality": {
                "score": 5,
                "confidence": 1,
                "reasoning": "The tonality should be informative and accessible, avoiding condescension or excessive technical jargon. A perfect score would entail a clear, neutral, and engaging tone suited for a general audience without a scientific background."
            },
            "relevance": {
                "score": 5,
                "confidence": 1,
                "reasoning": "The response will be highly relevant if it explains quantum computing, and it will be irrelevant if it deviates from this topic."
            },
            "intentMatch": {
                "score": 5,
                "confidence": 1,
                "reasoning": "The intent is a straightforward request for an explanation. The intent match will be perfect if the response provides an explanation."
            },
            "toxicity": {
                "isToxic": false,
                "confidence": 1,
                "reasoning": "The prompt is not toxic."
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
  .filter((key) => key !== "toxicity" && key !== "overAllAssessment")
  .map((key) => {
    const metric = evalobject[key as keyof Evaluation] as Metric;
    return { name: key, value: metric.score };
  });

const totalScore = evalobject.overAllAssessment.totalScore;

console.log(data);
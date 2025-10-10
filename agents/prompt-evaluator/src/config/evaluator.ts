import { GoogleGenAI } from "@google/genai";
import { RubrixEvaluationCriteria, RubrixEvaluationResult } from "../types/types";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY is not set in environment variables.");
}

const gemini = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || "",

})

export async function PromptEvaluator(prompt: string):Promise<RubrixEvaluationResult>{
    try{
        const evaluationCriteria: RubrixEvaluationCriteria[] =[
            
        ]
    }catch(error){
        console.error("Error in prompt evaluator", error);
        throw error;
    }
}

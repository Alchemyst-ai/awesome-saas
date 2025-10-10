import { GoogleGenerativeAI } from "@google/generative-ai";
import { EvaluationCriteria, EvaluationResults } from "../types/types";
import dotenv from "dotenv";
import { llmEvaluation } from "./llmEvaluatoin";
import { v4 as uuidv4 } from "uuid";
import { searchContext } from "@/lib/alchemyst";
dotenv.config();
import { addContext } from "@/lib/addContext";  
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables. Please add it to your .env.local file.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function PromptEvaluator(prompt: string):Promise<EvaluationResults>{
    try{
        //adding only prompt to context
        await addContext(prompt);
        
        const llmContext = await searchContext(prompt);
        
        
        const evalationPrompt = llmEvaluation(prompt, llmContext);
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(evalationPrompt);
        const responseText = result.response.text();
        
        // Clean the response text to extract JSON
        const cleanedText = responseText
            .replace(/^[\s`]*```json[\s`]*/i, "") // Remove opening ```json
            .replace(/[\s`]*```$/i, "") // Remove closing ```
            .trim();
        
        const llmresult: EvaluationCriteria = JSON.parse(cleanedText);
        
        // Store both the prompt and llm result to context
        await addContext(prompt, llmresult);
        
        return{
            promptId: uuidv4(),
            originalPrompt: prompt,
            evaluation: llmresult,
        };
    }catch(error){
        console.error("Error in prompt evaluator", error);
        throw error;
    }
}

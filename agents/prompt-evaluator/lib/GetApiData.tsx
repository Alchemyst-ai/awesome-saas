import axios from "axios";
import { EvaluationCriteria } from "@/src/types/types";
export default async function getApiData(prompt: string): Promise<EvaluationCriteria> {
    try{
        
        const response = await axios.post("/api/prompt-evaluator", { prompt });
        if(!response){
            throw new Error("The response is not generated");
        }
        return response.data;
    }
    catch(error){
        console.error(error);
        throw error;
    }
}
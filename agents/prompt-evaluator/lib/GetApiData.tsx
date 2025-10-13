import axios from "axios";

export default async function getApiData(prompt: string): Promise<any>{
    try{
        
        const response = await axios.post("/api/prompt-evaluator", { prompt });
        console.log(response)
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
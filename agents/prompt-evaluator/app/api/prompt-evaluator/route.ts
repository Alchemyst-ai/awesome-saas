
import { PromptEvaluator } from "@/src/config/evaluator";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    try{
        const {prompt} = await request.json();
        if(!prompt || typeof prompt !== "string"){
            return NextResponse.json({error: "Invalid prompt"}, {status: 400});
        }

        const evaluation = await PromptEvaluator(prompt);
        return NextResponse.json({evaluation}, {status: 200});

    }catch(error){
        console.error("Error in prompt evaluator", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
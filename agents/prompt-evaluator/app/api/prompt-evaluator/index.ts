import { NextResponse } from "next/server";

export async function POST(request: Request){
    try{
        const {prompt} = await request.json();

    }catch(error){
        console.error("Error in prompt evaluator", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
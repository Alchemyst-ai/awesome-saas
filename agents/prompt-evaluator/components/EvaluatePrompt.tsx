"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useQuery } from "@tanstack/react-query";
import getApiData from "@/lib/GetApiData";
import { LoaderOne } from "./ui/loader";



export default function EvaluatePrompt() {
  const [value, setValue] = useState("");
  const {data, refetch, isFetching, isLoading} = useQuery({
    queryKey:["prompt-evaluator"],
    queryFn: () => getApiData(value),
    enabled: false
  })

  // if(isLoading){
  //   return (
  //     <div>
  //       <LoaderOne />
  //     </div>
  //   )
  // }
  
  // useEffect(()=>{
  //   EvaluatePrompt
  // },[isLoading])

  const handleButton = ()=>{
    refetch();
  };

  return (
    <div className="w-full flex justify-center py-10 ">
      <div className="w-full max-w-lg rounded-2xl  backdrop-blur-md p-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between transition-all duration-300 ">
        {/* Input Section */}

        <div className="w-full flex flex-col gap-2 md:w-3/4">
          <Label htmlFor="prompt" className="text-slate-700 text-sm font-medium">
            Enter Your Prompt Here
          </Label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your prompt here..."
            className="w-full h-[45px] rounded-xl border font-semibold border-slate-300 text-[15px] placeholder:text-slate-400 focus:ring-2 transition-all"
          />
    
        </div>

        {/* Button Section */}
        <div className="w-full md:w-auto">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleButton}
            disabled={value.trim() === "" || isFetching}
            className="w-full md:w-auto h-[45px] rounded-xl bg-black text-white text-[15px] font-medium hover:opacity-90 transition-all"
          >
            {isFetching ? "Processing": "Evaluate" }
            
          </Button>
        </div>
      </div>
    </div>
  );
}

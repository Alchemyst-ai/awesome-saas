"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useQuery } from "@tanstack/react-query";
import getApiData from "@/lib/GetApiData";

export default function EvaluatePrompt() {
  const [value, setValue] = useState("");
  const { refetch, isFetching } = useQuery({
    queryKey: ["prompt-evaluator"],
    queryFn: () => getApiData(value),
    enabled: false,
  });

  const handleButton = async() => {
    try{
      await refetch();
    }
    catch(error){
      console.error(error);
    }
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full max-w-5xl rounded-2xl backdrop-blur-md p-6 flex flex-col gap-2 transition-all duration-300">
        <Label
          htmlFor="prompt"
          className="text-slate-700 text-sm font-medium mb-1"
        >
          Enter Your Prompt Here
        </Label>

        <div className="flex flex-col md:flex-row items-center gap-2 w-full">
          <Input
            value={value}
            onChange={(e) => {setValue(e.target.value)}}
            placeholder="Type your prompt here..."
            className="w-full h-[45px] rounded-xl border font-semibold border-slate-300 text-[15px] placeholder:text-slate-400 focus:ring-2 transition-all"
          />

          <Button
            variant="secondary"
            size="lg"
            onClick={handleButton}
            disabled={value.trim() === "" || isFetching}
            className="h-[45px] px-6 rounded-xl bg-black text-white text-[15px] font-medium hover:opacity-90 transition-all whitespace-nowrap"
          >
            {isFetching ? "Processing" : "Evaluate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

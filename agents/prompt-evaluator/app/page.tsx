"use client";

import EvaluatePrompt from "@/components/EvaluatePrompt";
import { DonutChartLegend } from "@/components/DonutChartLegend";
import Header from "@/components/Header";
import EvaluationDescription from "@/components/EvaluationDiscription";
import Footer from "@/components/Footer";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { LoaderOne } from "@/components/ui/loader";
import { useState, useEffect } from "react";
import DiscriptionPage from "@/components/DiscriptionPage";


export default function Home() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["prompt-evaluator"] });
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    
    const data = queryClient.getQueryData(["prompt-evaluator"]);
    setHasData(Boolean(data));
  }, [queryClient, isFetching]);
  
  return (
    <div>
      <Header />
      <EvaluatePrompt/>
      {isFetching ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <LoaderOne />
            <p className="text-slate-600 font-medium">Evaluating your prompt...</p>
          </div>
        </div>
      ) : hasData ? (
        <DonutChartLegend />
      ) : (
        <DiscriptionPage/>
      )}
      <EvaluationDescription/>
      <Footer />
    </div>
  );
}

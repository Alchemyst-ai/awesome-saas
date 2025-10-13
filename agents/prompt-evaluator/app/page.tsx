"use client";

import EvaluatePrompt from "@/components/EvaluatePrompt";
import { DonutChartLegend } from "@/components/DonutChartLegend";
import Header from "@/components/Header";
import EvaluationDescription from "@/components/EvaluationDiscription";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderOne } from "@/components/ui/loader";


export default function Home() {
  const queryClient = useQueryClient();
  const loading = queryClient.isFetching();
  return (
    <div>
      <Header />
      <EvaluatePrompt/>
      <DonutChartLegend />        
      <EvaluationDescription/>
      <Footer />
    </div>
  );
}

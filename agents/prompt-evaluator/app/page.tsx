import EvaluatePrompt from "@/components/EvaluatePrompt";
import { DonutChartLegend } from "@/components/DonutChartLegend";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />
      <EvaluatePrompt/>
      <DonutChartLegend />
    </div>
  );
}

import EvaluatePrompt from "@/components/EvaluatePrompt";
import { DonutChartLegend } from "@/components/DonutChartLegend";
import Header from "@/components/Header";
import EvaluationDescription from "@/components/EvaluationDiscription";
import Footer from "@/components/Footer";

export default function Home() {
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

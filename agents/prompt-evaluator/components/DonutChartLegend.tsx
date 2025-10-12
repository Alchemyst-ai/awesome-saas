import { data, summary,improvedSuggestions } from "./data";
import { DonutChart } from "./DonatChart";
import { ImprovedPrompt } from "./ImprovedPrompt";
import PointDiscription from "./PointDiscription";
import Summary from "./Summary";
import TotalScore from "./TotalScore";
import { improvedPrompt } from "./data";
export function DonutChartLegend() {
    return (
        <div className="flex flex-col ">
            <div className="flex justify-around items-center gap-10">

            <DonutChart data={data} width={800} height={420} />
            <TotalScore />
            </div>
            <div className="flex flex-col md:flex-row justify-around items-center gap-10">
            <PointDiscription />
            <div className="flex flex-col">
            <Summary improvedSuggestions={improvedSuggestions}/>
            <ImprovedPrompt improvedPrompt={improvedPrompt} />
            </div>
            </div>
        </div>
    )
}
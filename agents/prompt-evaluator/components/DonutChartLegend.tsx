import { data } from "./data";
import { DonutChart } from "./DonatChart";

export function DonutChartLegend() {
    return (
        <div>
            <DonutChart data={data} width={700} height={400} />
        </div>
    )
}
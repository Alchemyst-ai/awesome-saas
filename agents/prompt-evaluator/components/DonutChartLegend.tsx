"use client";

import { useDonutChartData } from "./data";
import { DonutChart } from "./DonatChart";
import { ImprovedPrompt } from "./ImprovedPrompt";
import PointDiscription from "./PointDiscription";
import Summary from "./Summary";
import TotalScore from "./TotalScore";
import { motion } from "motion/react";

export function DonutChartLegend() {
  const { improvedPrompt, improvedSuggestions, chartData } = useDonutChartData();

  return (
    <div className="flex flex-col ">
      <div className="flex justify-around items-center w-full gap-10">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <DonutChart data={chartData} width={960} height={520} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <TotalScore />
        </motion.div>
      </div>
      <div className="flex flex-col md:flex-row justify-around items-center gap-10">
        <PointDiscription />
        <div className="flex flex-col">
          <Summary improvedSuggestions={improvedSuggestions} />
          <ImprovedPrompt improvedPrompt={improvedPrompt} />
        </div>
      </div>
    </div>
  );
}

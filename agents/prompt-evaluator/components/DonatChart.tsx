"use client";

import { useMemo } from "react";
import * as d3 from "d3";
import { useDonutChartData } from "./data";
import DonutSlice from "./DonutSlice";
import { DonutChartProps } from "@/src/types/types";
import { DataItem } from "@/src/types/types";

const MARGIN_X = 240;
const MARGIN_Y = 100;

export const DonutChart = ({ width, height, data }: DonutChartProps) => {
  const { totalScore } = useDonutChartData();

  const radius = Math.min(width - 2 * MARGIN_X, height - 2 * MARGIN_Y) / 2;
  const innerRadius = radius / 1.8;

  const pie = useMemo(() => {
    const pieGenerator = d3.pie<DataItem>().value((d) => d.value);
    return pieGenerator(data);
  }, [data]);

  return (
    <div className="flex justify-center items-center">
      <svg
        width={width}
        height={height}
        className="bg-white rounded-2xl p-4"
        style={{ overflow: "visible" }}
      >
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {pie.map((grp, i) => (
            <DonutSlice
              key={i}
              grp={grp}
              i={i}
              radius={radius}
              innerRadius={innerRadius}
            />
          ))}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={28}
            fontWeight={700}
            fill="#111827"
            className="font-bold"
          >
            {totalScore}
          </text>
        </g>
      </svg>
    </div>
  );
};

"use client";

import { useMemo } from "react";
import * as d3 from "d3";
import { useDonutChartData } from "./data";


type DataItem = {
  name: string;
  value: number;
};
type DonutChartProps = {
  width: number;
  height: number;
  data: DataItem[];
};

const MARGIN_X = 240;
const MARGIN_Y = 100;
const INFLEXION_PADDING = 40;

const colors = [
  "#F87171", // red
  "#FBBF24", // amber
  "#60A5FA", // blue
  "#A78BFA", // purple
  "#34D399", // green
  "#F472B6", // pink
];

export const DonutChart = ({ width, height, data }: DonutChartProps) => {
  const {totalScore} = useDonutChartData();

  
  const radius = Math.min(width - 2 * MARGIN_X, height - 2 * MARGIN_Y) / 2;
  const innerRadius = radius / 1.8;

  const pie = useMemo(() => {
    const pieGenerator = d3.pie<DataItem>().value((d) => d.value);
    return pieGenerator(data);
  }, [data]);

  const arcGenerator = d3.arc();

  const shapes = pie.map((grp, i) => {
    const sliceInfo = {
      innerRadius,
      outerRadius: radius,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
      padAngle: 0.02,
    };

    const centroid = arcGenerator.centroid(sliceInfo);
    const slicePath = arcGenerator(sliceInfo);

    const inflexionInfo = {
      innerRadius: radius + INFLEXION_PADDING,
      outerRadius: radius + INFLEXION_PADDING,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };
    const inflexionPoint = arcGenerator.centroid(inflexionInfo);

    const isRightLabel = inflexionPoint[0] > 0;
    const labelPosX = inflexionPoint[0] + 70 * (isRightLabel ? 1 : -1);
    const textAnchor = isRightLabel ? "start" : "end";
    const label = `${grp.data.name} (${grp.value})`;

    return (
      <g key={i} className="transition-all duration-300 hover:scale-[1.02]">
        <path
          d={`${slicePath}`}
          fill={colors[i % colors.length]}
          stroke="white"
          strokeWidth={2}
          style={{
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
            transition: "all 0.3s ease",
          }}
        />
        <line
          x1={centroid[0]}
          y1={centroid[1]}
          x2={inflexionPoint[0]}
          y2={inflexionPoint[1]}
          stroke="black"
          strokeWidth={1}
        />
        <line
          x1={inflexionPoint[0]}
          y1={inflexionPoint[1]}
          x2={labelPosX}
          y2={inflexionPoint[1]}
          stroke="black"
          strokeWidth={1}
        />
        <text
          x={labelPosX + (isRightLabel ? 4 : -4)}
          y={inflexionPoint[1]}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={14}
          fontWeight={500}
          fill="#374151"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <div className="flex justify-center items-center">
      <svg
        width={width}
        height={height}
        className="bg-white rounded-2xl  p-4 "
        style={{ overflow: "visible" }}
      >
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {shapes}
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

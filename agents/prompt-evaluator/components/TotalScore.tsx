"use client";


import { useDonutChartData } from "./data";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function TotalScore() {
  const {totalScore} = useDonutChartData();
  const percentage = ((totalScore / 5) * 100).toFixed(0);

  return (
    <div className="flex  mt-6">
      <Card className="w-full max-w-sm bg-white border border-gray-200 shadow-lg rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold text-gray-800 tracking-wide">
             Total Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
              {percentage}%
            </div>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 ease-in-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Based on an overall score of your promot
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

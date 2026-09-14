import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import AnimatedCounter from "../common/AnimatedCounter";

export default function ObjectiveChartCard({ question }) {
  const { questionText, type, totalAnswers = 0, data = [] } = question;

  return (
    <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brown-100 text-brown-800 border border-brown-200">
            {type === "single_choice" ? "Single Choice" : "Multiple Choice"}
          </span>
          <span className="text-xs font-semibold text-brown-600">
            <AnimatedCounter value={totalAnswers} suffix=" responses" />
          </span>
        </div>
        <h4 className="text-sm font-bold text-brown-900 leading-snug font-serif">
          {questionText}
        </h4>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="option"
              tick={{ fontSize: 10, fill: "hsl(18, 38%, 27%)" }}
              interval={0}
              tickFormatter={(val) =>
                val.length > 14 ? `${val.substring(0, 12)}...` : val
              }
            />
            <YAxis tick={{ fontSize: 10, fill: "hsl(24, 25%, 45%)" }} />
            <Tooltip
              formatter={(value, name, item) => [
                `${item.payload.count} respondents (${item.payload.percentage}%)`,
                "Responses",
              ]}
              contentStyle={{
                backgroundColor: "hsl(14, 42%, 13%)",
                borderRadius: "10px",
                border: "1px solid hsl(26, 20%, 30%)",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
            />
            <Bar dataKey="count" fill="hsl(22, 32%, 46%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Option Table */}
      <div className="space-y-1.5 mt-2 pt-3 border-t border-brown-100">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-brown-50 transition-colors"
          >
            <span className="text-brown-700 truncate max-w-[220px]" title={row.option}>
              {row.option}
            </span>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="font-semibold text-brown-900">{row.count}</span>
              <span className="text-brown-400">({row.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

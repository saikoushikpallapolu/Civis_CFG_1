import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ObjectiveChartCard({ question }) {
  const { questionText, type, totalAnswers, data = [] } = question;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
            {type === "single_choice" ? "Single Choice" : "Multiple Choice"}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {totalAnswers} votes
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug">
          {questionText}
        </h4>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="option"
              tick={{ fontSize: 10 }}
              interval={0}
              tickFormatter={(val) =>
                val.length > 14 ? `${val.substring(0, 12)}...` : val
              }
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value, name, item) => [
                `${item.payload.count} respondents (${item.payload.percentage}%)`,
                "Responses",
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Option Table */}
      <div className="space-y-1.5 mt-2 pt-3 border-t border-slate-100">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50"
          >
            <span className="text-slate-700 truncate max-w-[220px]" title={row.option}>
              {row.option}
            </span>
            <div className="flex items-center space-x-2 font-mono">
              <span className="font-semibold text-slate-900">{row.count}</span>
              <span className="text-slate-400">({row.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function SentimentDonutChart({ data = [], overallSentiment = {} }) {
  const { positive = 0, neutral = 0, negative = 0 } = overallSentiment;

  const chartData = data && data.length > 0 ? data : [
    { name: "Positive", value: positive, color: "#10B981" },
    { name: "Neutral", value: neutral, color: "#6B7280" },
    { name: "Negative", value: negative, color: "#EF4444" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Overall Sentiment</h3>
          <p className="text-xs text-slate-500">AI sentiment distribution across citizen feedback</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {positive}% Net Positive
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 font-outfit">{positive}%</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Positive</span>
        </div>
      </div>

      {/* Legend / Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
        <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="text-xs font-semibold text-emerald-800">Positive</div>
          <div className="text-base font-bold text-emerald-600">{positive}%</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-semibold text-slate-700">Neutral</div>
          <div className="text-base font-bold text-slate-600">{neutral}%</div>
        </div>
        <div className="p-2 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="text-xs font-semibold text-rose-800">Negative</div>
          <div className="text-base font-bold text-rose-600">{negative}%</div>
        </div>
      </div>
    </div>
  );
}

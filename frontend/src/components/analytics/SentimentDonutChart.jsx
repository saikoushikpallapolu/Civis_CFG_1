import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import AnimatedCounter from "../common/AnimatedCounter";

export default function SentimentDonutChart({ data = [], overallSentiment = {} }) {
  const { positive = 0, neutral = 0, negative = 0 } = overallSentiment;

  // Dignified government sentiment colors: muted teal, muted warm brown, muted warm red
  const chartData =
    data && data.length > 0
      ? data
      : [
          { name: "Supportive", value: positive, color: "hsl(152, 42%, 38%)" },
          { name: "Neutral / Inconclusive", value: neutral, color: "hsl(25, 20%, 65%)" },
          { name: "Critical / Opposed", value: negative, color: "hsl(5, 55%, 48%)" },
        ];

  return (
    <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-brown-900 font-serif">Public Sentiment Stance</h3>
          <p className="text-xs text-brown-500">Distribution across qualitative written submissions</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-gov-teal border border-emerald-200">
          <AnimatedCounter value={positive} suffix="% Net Support" />
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: "hsl(14, 42%, 13%)",
                borderRadius: "10px",
                border: "1px solid hsl(26, 20%, 30%)",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
              animationBegin={100}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-brown-950 font-serif">
            <AnimatedCounter value={positive} suffix="%" />
          </span>
          <span className="text-[10px] uppercase font-bold text-brown-400 tracking-wider">
            Supportive
          </span>
        </div>
      </div>

      {/* Legend / Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-brown-100 text-center">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
          <div className="text-[11px] font-semibold text-gov-teal">Supportive</div>
          <div className="text-base font-bold text-emerald-800">
            <AnimatedCounter value={positive} suffix="%" />
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-brown-50 border border-brown-200/80">
          <div className="text-[11px] font-semibold text-brown-600">Neutral</div>
          <div className="text-base font-bold text-brown-800">
            <AnimatedCounter value={neutral} suffix="%" />
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/60">
          <div className="text-[11px] font-semibold text-gov-red">Critical</div>
          <div className="text-base font-bold text-rose-800">
            <AnimatedCounter value={negative} suffix="%" />
          </div>
        </div>
      </div>
    </div>
  );
}

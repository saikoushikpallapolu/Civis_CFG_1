import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function ThemeBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 text-center text-sm text-brown-500">
        No qualitative theme breakdown available yet.
      </div>
    );
  }

  // Palette of subtle government warm tones
  const themeColors = [
    "hsl(22, 32%, 46%)",
    "hsl(36, 60%, 45%)",
    "hsl(152, 42%, 38%)",
    "hsl(20, 36%, 36%)",
    "hsl(28, 48%, 52%)",
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-bold text-brown-900 font-serif">
          Substantive Themes & Deliberation Drivers
        </h3>
        <p className="text-xs text-brown-500">
          Prevalence (% of citizens raising this issue) & predominant sentiment tone
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "hsl(24, 25%, 45%)" }} />
            <YAxis
              type="category"
              dataKey="theme"
              width={140}
              tick={{ fontSize: 11, fill: "hsl(18, 38%, 27%)" }}
              tickFormatter={(val) =>
                val.length > 20 ? `${val.substring(0, 18)}...` : val
              }
            />
            <Tooltip
              formatter={(value, name, item) => [
                `${value}% prevalence (${item.payload.sentiment})`,
                "Citizen Discussion",
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
            <Bar dataKey="prevalence" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`theme-bar-${index}`}
                  fill={entry.fill || themeColors[index % themeColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Cards List */}
      <div className="space-y-2 mt-4 pt-4 border-t border-brown-100">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-brown-50/70 border border-brown-100 text-xs hover:border-brown-200 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: item.fill || themeColors[idx % themeColors.length],
                }}
              />
              <span className="font-semibold text-brown-800">{item.theme}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-brown-900">{item.prevalence}%</span>
              <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-brown-200 text-brown-700">
                {item.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

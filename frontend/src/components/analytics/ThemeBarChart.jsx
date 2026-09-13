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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
        No theme breakdown available yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Key Themes & Citizen Drivers</h3>
        <p className="text-xs text-slate-500">Prevalence (% of citizens discussing this theme) & sentiment</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="theme"
              width={140}
              tick={{ fontSize: 11, fill: "#334155" }}
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
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="prevalence" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`theme-bar-${index}`} fill={entry.fill || "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Cards List */}
      <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
          >
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.fill || "#6366f1" }}
              />
              <span className="font-semibold text-slate-800">{item.theme}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">{item.prevalence}%</span>
              <span className="capitalize px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                {item.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

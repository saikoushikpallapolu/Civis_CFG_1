import React from "react";
import { AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function ActionableInsightsList({ insights = [] }) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case "high":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Actionable Policy Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            Synthesized policy modifications derived directly from citizen concerns
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {insights.length} recommendations
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((item, idx) => (
          <div
            key={item._id || idx}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                    item.priority
                  )}`}
                >
                  {item.priority} Priority
                </span>
                {item.area && (
                  <span className="text-xs font-semibold text-slate-500">
                    • {item.area}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800 leading-snug">
                {item.recommendation}
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export default function ExecutiveSummaryCard({
  summary,
  generatedAt,
  isCached,
  onRegenerate,
  isRegenerating,
}) {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-950/20 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                AI Executive Synthesis
              </span>
              <h2 className="text-xl font-bold font-outfit text-white">
                Decision Brief for Lawmakers
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isCached && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                MongoDB Cache Active
              </span>
            )}

            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all disabled:opacity-50"
              title="Force Gemini 3.6 Flash to recompute synthesis from all citizen submissions"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`}
              />
              <span>{isRegenerating ? "Regenerating..." : "Refresh Insights"}</span>
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal bg-white/5 p-4 rounded-2xl border border-white/10">
          "{summary || "Analyzing citizen submissions..."}"
        </p>

        {generatedAt && (
          <p className="text-[11px] text-slate-400 mt-3 flex items-center space-x-1">
            <span>Generated on {new Date(generatedAt).toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
}

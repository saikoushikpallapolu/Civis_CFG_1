import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Landmark, ShieldCheck } from "lucide-react";
import StatusPulse from "../common/StatusPulse";

export default function ExecutiveSummaryCard({
  summary,
  generatedAt,
  isCached,
  onRegenerate,
  isRegenerating,
}) {
  const [displayedText, setDisplayedText] = useState("");

  // Smooth typewriter reveal on load
  useEffect(() => {
    if (!summary) {
      setDisplayedText("Analyzing citizen submissions and synthesizing policy imperatives...");
      return;
    }

    // Quick typewriter effect for snappy government dashboard feel
    let currentIndex = 0;
    const fullText = `"${summary}"`;
    setDisplayedText(fullText.slice(0, 15));

    const interval = setInterval(() => {
      currentIndex += 4;
      if (currentIndex >= fullText.length) {
        setDisplayedText(fullText);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIndex));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [summary]);

  return (
    <div className="bg-gradient-to-br from-brown-900 via-brown-950 to-brown-950 text-brown-100 p-6 sm:p-8 rounded-3xl shadow-xl border border-brown-800/80 relative overflow-hidden">
      {/* Warm amber subtle glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-accent-amber/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brown-800/80 border border-brown-700 flex items-center justify-center text-amber-200">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Statutory Synthesis Brief
                </span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-[10px] text-brown-300">Policy Officers</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-white">
                Executive Synthesis for Lawmakers
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isCached && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gov-teal" />
                <span>Encrypted Cache Active</span>
              </span>
            )}

            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="interactive-btn inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all disabled:opacity-50 shadow-xs"
              title="Force AI engine to recompute synthesis from all citizen submissions"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-200 ${isRegenerating ? "animate-spin" : ""}`}
              />
              <span>{isRegenerating ? "Synthesizing..." : "Re-synthesize"}</span>
            </button>
          </div>
        </div>

        {/* Text body */}
        <div className="bg-brown-900/50 p-5 rounded-2xl border border-brown-800/70 backdrop-blur-xs">
          <p className="text-sm sm:text-base text-brown-100 leading-relaxed font-normal min-h-[4rem]">
            {displayedText}
          </p>
        </div>

        {generatedAt && (
          <div className="flex items-center justify-between text-[11px] text-brown-400 mt-3 pt-2">
            <span>Aggregated from verified citizen submissions</span>
            <span>Generated on {new Date(generatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

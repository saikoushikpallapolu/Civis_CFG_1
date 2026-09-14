import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { MessageSquareQuote, ChevronRight, HelpCircle } from "lucide-react";
import TooltipHover from "../common/TooltipHover";

export default function CorrelationStackedChart({
  data = [],
  segmentBreakdown = [],
}) {
  const [selectedSegment, setSelectedSegment] = useState(
    segmentBreakdown.length > 0 ? segmentBreakdown[0] : null
  );

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 text-center text-sm text-brown-500">
        No cohort correlation data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-brown-900 font-serif">
              Qualitative vs. Quantitative Correlation
            </h3>
            <p className="text-xs text-brown-500">
              Cross-correlating objective choice selection against qualitative commentary
            </p>
          </div>
          <TooltipHover content="Cross-analyzes multiple choice survey responses against free-text explanations using Gemini semantic clustering">
            <HelpCircle className="w-4 h-4 text-brown-400 cursor-help" />
          </TooltipHover>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brown-100 text-brown-800 rounded-full border border-brown-200 self-start sm:self-auto">
          Cohort Cross-Analysis
        </span>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="segment"
              tick={{ fontSize: 11, fill: "hsl(18, 38%, 27%)" }}
              tickFormatter={(val) =>
                val.length > 16 ? `${val.substring(0, 14)}...` : val
              }
            />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "hsl(24, 25%, 45%)" }} />
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
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="positive" name="Supportive %" stackId="sentiment" fill="hsl(152, 42%, 38%)" />
            <Bar dataKey="neutral" name="Neutral %" stackId="sentiment" fill="hsl(25, 20%, 72%)" />
            <Bar dataKey="negative" name="Critical %" stackId="sentiment" fill="hsl(5, 55%, 48%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Qualitative Slices & Quotes */}
      <div className="pt-4 border-t border-brown-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brown-400">
            Citizen Cohort Explanations
          </h4>
          <span className="text-[11px] text-brown-500">Select option cohort to read quotes</span>
        </div>

        {/* Pills to choose segment */}
        <div className="flex flex-wrap gap-2 mb-4">
          {segmentBreakdown.map((seg, idx) => {
            const isSelected = selectedSegment?.option === seg.option;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSegment(seg)}
                className={`interactive-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-brown-800 text-brown-50 shadow-xs border border-brown-800"
                    : "bg-brown-100/80 text-brown-700 hover:bg-brown-200 border border-brown-200"
                }`}
              >
                {seg.option}
              </button>
            );
          })}
        </div>

        {/* Details Card for selected segment */}
        {selectedSegment && (
          <div className="p-4 rounded-xl bg-brown-50/70 border border-brown-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brown-900 font-serif">
                Cohort: "{selectedSegment.option}"
              </span>
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <span className="text-gov-teal">
                  {selectedSegment.sentiment?.positive}% Support
                </span>
                <span className="text-brown-300">•</span>
                <span className="text-gov-red">
                  {selectedSegment.sentiment?.negative}% Oppose
                </span>
              </div>
            </div>

            <p className="text-xs text-brown-700 leading-relaxed">
              <strong className="text-brown-900 font-semibold">Synthesized Position: </strong>
              {selectedSegment.summary}
            </p>

            {/* Verbatim Quotes */}
            {selectedSegment.sampleQuotes && selectedSegment.sampleQuotes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-brown-200/80">
                <span className="text-[11px] font-bold text-brown-500 uppercase tracking-wide flex items-center">
                  <MessageSquareQuote className="w-3.5 h-3.5 mr-1 text-accent-gold" />
                  Direct Citizen Citations
                </span>
                {selectedSegment.sampleQuotes.map((quote, qIdx) => (
                  <p
                    key={qIdx}
                    className="text-xs italic text-brown-800 pl-3 border-l-2 border-brown-600 bg-white/80 py-2 px-3 rounded-r-lg"
                  >
                    "{quote}"
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

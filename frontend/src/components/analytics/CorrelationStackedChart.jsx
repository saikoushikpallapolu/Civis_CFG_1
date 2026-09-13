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
import { MessageSquareQuote, ChevronRight } from "lucide-react";

export default function CorrelationStackedChart({
  data = [],
  segmentBreakdown = [],
}) {
  const [selectedSegment, setSelectedSegment] = useState(
    segmentBreakdown.length > 0 ? segmentBreakdown[0] : null
  );

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
        No segment correlation data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            AI Correlation Engine: Sentiment Sliced by Choice
          </h3>
          <p className="text-xs text-slate-500">
            Understand WHY citizens with different MCQ choices feel positive or critical
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 self-start sm:self-auto">
          Qualitative + Quantitative
        </span>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="segment"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) =>
                val.length > 16 ? `${val.substring(0, 14)}...` : val
              }
            />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
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
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="positive" name="Positive %" stackId="sentiment" fill="#10B981" />
            <Bar dataKey="neutral" name="Neutral %" stackId="sentiment" fill="#94A3B8" />
            <Bar dataKey="negative" name="Negative %" stackId="sentiment" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Qualitative Slices & Quotes */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Select Segment to View Real Citizen Explanations
        </h4>

        {/* Pills to choose segment */}
        <div className="flex flex-wrap gap-2 mb-4">
          {segmentBreakdown.map((seg, idx) => {
            const isSelected = selectedSegment?.option === seg.option;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSegment(seg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {seg.option}
              </button>
            );
          })}
        </div>

        {/* Details Card for selected segment */}
        {selectedSegment && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                Segment: "{selectedSegment.option}"
              </span>
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <span className="text-emerald-600">
                  {selectedSegment.sentiment?.positive}% Pos
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-rose-600">
                  {selectedSegment.sentiment?.negative}% Neg
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Synthesis: </strong>
              {selectedSegment.summary}
            </p>

            {/* Verbatim Quotes */}
            {selectedSegment.sampleQuotes && selectedSegment.sampleQuotes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center">
                  <MessageSquareQuote className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  Representative Citizen Quotes
                </span>
                {selectedSegment.sampleQuotes.map((quote, qIdx) => (
                  <p
                    key={qIdx}
                    className="text-xs italic text-slate-600 pl-3 border-l-2 border-indigo-400 bg-white/70 py-1.5 px-2 rounded-r-lg"
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

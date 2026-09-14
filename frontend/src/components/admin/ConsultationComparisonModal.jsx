import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { consultationApi } from "../../api/consultationApi";
import SkeletonCard from "../common/SkeletonCard";
import AnimatedCounter from "../common/AnimatedCounter";
import {
  X,
  Scale,
  Users,
  BarChart3,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Landmark,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

export default function ConsultationComparisonModal({
  selectedIds = [],
  onClose,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedIds || selectedIds.length < 2) return;

    setLoading(true);
    setError("");

    consultationApi
      .compareConsultations(selectedIds)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to generate comparison matrix.");
      })
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const consultations = data?.consultations || [];
  const summary = data?.summary || {};

  // Build Recharts dataset for sentiment comparison
  const sentimentComparisonData = consultations.map((c) => ({
    name: c.title.length > 20 ? `${c.title.slice(0, 18)}...` : c.title,
    fullName: c.title,
    positive: c.overallSentiment?.positive || 0,
    neutral: c.overallSentiment?.neutral || 0,
    negative: c.overallSentiment?.negative || 0,
    responses: c.responseCount || 0,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-white rounded-3xl border border-brown-200 shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-brown-100 flex items-center justify-between bg-gradient-to-r from-brown-50 via-white to-brown-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brown-800 text-amber-200 flex items-center justify-center border border-brown-700 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Cross-Policy Analysis
                </span>
                <span className="text-xs text-brown-400">•</span>
                <span className="text-xs font-semibold text-brown-600">
                  {consultations.length} Consultations Benchmarked
                </span>
              </div>
              <h2 className="text-xl font-bold text-brown-950 font-serif mt-0.5">
                Multi-Policy Comparative Benchmarking
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-brown-400 hover:text-brown-800 hover:bg-brown-100 transition-colors"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonCard count={1} />
                <SkeletonCard count={1} />
              </div>
              <SkeletonCard type="chart" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-12 text-center text-brown-500">
              Select at least 2 consultations to view cross-policy comparison.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-brown-50/70 border border-brown-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brown-500">
                    Policies Under Review
                  </span>
                  <div className="text-2xl font-bold text-brown-950 font-serif mt-1">
                    {consultations.length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brown-50/70 border border-brown-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brown-500">
                    Total Combined Submissions
                  </span>
                  <div className="text-2xl font-bold text-brown-900 font-serif mt-1">
                    <AnimatedCounter value={summary.totalCombinedResponses || 0} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brown-50/70 border border-brown-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brown-500">
                    Analytical Model
                  </span>
                  <div className="text-xs font-bold text-brown-800 flex items-center gap-1.5 mt-2">
                    <Sparkles className="w-4 h-4 text-accent-gold" />
                    <span>Gemini 3.6 Flash Multi-Cohort Synthesis</span>
                  </div>
                </div>
              </div>

              {/* Visual Sentiment Comparison Chart */}
              <div className="bg-white p-5 rounded-2xl border border-brown-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brown-900 font-serif">
                    Comparative Net Citizen Sentiment (%)
                  </h3>
                  <span className="text-[11px] text-brown-500">Positive vs. Neutral vs. Negative</span>
                </div>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sentimentComparisonData}
                      margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "hsl(18, 38%, 27%)" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fontSize: 11, fill: "hsl(24, 25%, 45%)" }}
                      />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{
                          backgroundColor: "hsl(14, 42%, 13%)",
                          borderRadius: "10px",
                          border: "1px solid hsl(26, 20%, 30%)",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                      <Bar dataKey="positive" name="Supportive %" fill="hsl(152, 42%, 38%)" />
                      <Bar dataKey="neutral" name="Neutral %" fill="hsl(25, 20%, 72%)" />
                      <Bar dataKey="negative" name="Critical %" fill="hsl(5, 55%, 48%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side-by-Side Policy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultations.map((c) => (
                  <div
                    key={c._id}
                    className="p-5 rounded-2xl border border-brown-200 bg-brown-50/30 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brown-100 text-brown-800 border border-brown-200">
                          {c.category}
                        </span>
                        <span className="text-xs font-bold text-brown-600">
                          <AnimatedCounter value={c.responseCount} suffix=" Submissions" />
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-brown-950 font-serif leading-snug">
                        {c.title}
                      </h4>

                      <p className="text-xs text-brown-600 line-clamp-3 leading-relaxed">
                        {c.executiveSummary}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-brown-200/80">
                      {/* Themes */}
                      {c.topThemes && c.topThemes.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brown-400">
                            Key Thematic Drivers
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {c.topThemes.slice(0, 3).map((theme, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-brown-200 text-brown-800"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Link */}
                      <Link
                        to={`/admin/consultations/${c._id}/analytics`}
                        className="interactive-btn inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-white hover:bg-brown-100/80 border border-brown-200 text-xs font-bold text-brown-800 transition-colors"
                      >
                        <span>Open Detailed Analytics</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brown-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brown-100 bg-brown-50/50 flex items-center justify-between">
          <span className="text-xs text-brown-500">
            Civis Civic Intelligence Platform • Comparative Decision Matrix
          </span>
          <button
            type="button"
            onClick={onClose}
            className="interactive-btn px-4 py-2 rounded-xl text-xs font-bold bg-brown-800 hover:bg-brown-900 text-brown-50 transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </motion.div>
    </div>
  );
}

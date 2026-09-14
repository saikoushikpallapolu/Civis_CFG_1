import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import TooltipHover from "../common/TooltipHover";

export default function ActionableInsightsList({ insights = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!insights || insights.length === 0) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case "high":
        return {
          bg: "bg-rose-50 text-gov-red border-rose-200/80",
          dot: "bg-gov-red",
          label: "Urgent Priority",
        };
      case "medium":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200/80",
          dot: "bg-accent-gold",
          label: "Advisory Priority",
        };
      case "low":
        return {
          bg: "bg-brown-100 text-brown-700 border-brown-200/80",
          dot: "bg-brown-400",
          label: "Observation",
        };
      default:
        return {
          bg: "bg-brown-100 text-brown-700 border-brown-200/80",
          dot: "bg-brown-400",
          label: p || "Advisory",
        };
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-brown-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brown-100">
        <div>
          <h3 className="text-base font-bold text-brown-900 font-serif">
            Actionable Statutory Recommendations
          </h3>
          <p className="text-xs text-brown-500">
            Synthesized policy amendments derived directly from citizen concerns
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brown-100 text-brown-800 rounded-full border border-brown-200">
          {insights.length} amendments recommended
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((item, idx) => {
          const itemId = item._id || idx;
          const isExpanded = expandedId === itemId;
          const priority = getPriorityBadge(item.priority);

          return (
            <div
              key={itemId}
              className="rounded-xl border border-brown-200 bg-white/80 hover:border-brown-300 transition-all overflow-hidden"
            >
              <div
                onClick={() => toggleExpand(itemId)}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${priority.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                      {priority.label}
                    </span>
                    {item.area && (
                      <span className="text-xs font-semibold text-brown-500">
                        • {item.area}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-brown-900 leading-snug">
                    {item.recommendation}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    className="interactive-btn inline-flex items-center gap-1 text-xs font-semibold text-brown-700 bg-brown-100/70 hover:bg-brown-200/70 px-3 py-1.5 rounded-lg border border-brown-200"
                  >
                    <span>{isExpanded ? "Collapse" : "Review Impact"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Accordion Expandable Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-brown-100 bg-brown-50/50 px-4 py-3 text-xs text-brown-700 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-brown-900">Legislative Context: </span>
                        <span>
                          {item.context ||
                            "Identified across citizen submissions as an essential adjustment to ensure policy compliance and broad community endorsement."}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-brown-600 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gov-teal shrink-0" />
                      <span>Recommended action for drafting committee consideration.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

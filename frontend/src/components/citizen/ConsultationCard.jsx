import React from "react";
import { Link } from "react-router-dom";
import { Users, ArrowRight, BarChart3, Clock, CheckCircle2 } from "lucide-react";

export default function ConsultationCard({ consultation, isAdmin }) {
  const { _id, title, category, description, status, responseCount = 0, questions = [] } = consultation;

  const getStatusColor = (st) => {
    switch (st) {
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "draft":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {category || "Public Policy"}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {description || "Join fellow citizens to review the policy draft and submit structured feedback for lawmakers."}
        </p>
      </div>

      <div>
        {/* Meta Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-3 border-t border-slate-100 mb-4">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{responseCount}</span>
            <span>{responseCount === 1 ? "response" : "responses"}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{questions.length} questions</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/consultations/${_id}`}
            className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold transition-all duration-200 shadow-sm"
          >
            <span>{status === "closed" ? "View Policy" : "Give Feedback"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {isAdmin && (
            <Link
              to={`/admin/consultations/${_id}/analytics`}
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              title="View AI Analytics Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

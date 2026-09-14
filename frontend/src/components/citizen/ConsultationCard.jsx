import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ArrowRight, BarChart3, FileText, CheckCircle2, Landmark } from "lucide-react";
import AnimatedCounter from "../common/AnimatedCounter";
import TooltipHover from "../common/TooltipHover";
import { useLanguage } from "../../context/LanguageContext";

export default function ConsultationCard({
  consultation,
  isAdmin,
  index = 0,
  variant = "standard", // "standard" | "spotlight"
}) {
  const { t, currentLanguage } = useLanguage();
  const { _id, title, category, description, status, responseCount = 0, questions = [] } = consultation;

  const displayTitle = (consultation.translations && consultation.translations[currentLanguage]?.title) || title;
  const displayCategory = (consultation.translations && consultation.translations[currentLanguage]?.category) || category;
  const displayDescription = (consultation.translations && consultation.translations[currentLanguage]?.description) || description;

  const getStatusBadge = (st) => {
    switch (st) {
      case "open":
        return {
          bg: "bg-emerald-50 text-gov-teal border-emerald-300",
          label: t("card_open"),
          dot: "bg-gov-teal animate-pulse",
        };
      case "closed":
        return {
          bg: "bg-brown-100 text-brown-600 border-brown-200",
          label: t("card_closed"),
          dot: "bg-brown-400",
        };
      case "draft":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          label: t("card_draft"),
          dot: "bg-accent-gold",
        };
      default:
        return {
          bg: "bg-brown-100 text-brown-600 border-brown-200",
          label: st,
          dot: "bg-brown-400",
        };
    }
  };

  const statusInfo = getStatusBadge(status);

  if (variant === "spotlight") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="interactive-card bg-gradient-to-br from-white via-brown-50/50 to-white rounded-3xl border-2 border-brown-300/80 p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-gold via-brown-600 to-gov-teal" />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-950 border border-amber-300">
              <Landmark className="w-3.5 h-3.5 text-accent-gold" />
              <span>{t("spotlight_badge")}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusInfo.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-brown-500 uppercase tracking-wider block mb-1">
              {displayCategory || "Public Policy"}
            </span>
            {/* Fully readable title without truncation */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brown-950 tracking-tight leading-snug">
              {displayTitle}
            </h3>
          </div>

          <p className="text-base text-brown-700 leading-relaxed max-w-3xl">
            {displayDescription}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t border-brown-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-brown-600 font-medium">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brown-500" />
              <span className="font-bold text-brown-900">
                <AnimatedCounter value={responseCount} />
              </span>
              <span>{t("spotlight_responses")}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brown-500" />
              <span>{questions.length} {t("spotlight_questions")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/consultations/${_id}`}
              className="interactive-btn inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 text-base font-semibold shadow-xs"
            >
              <span>{t("spotlight_give_feedback")}</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </Link>

            {isAdmin && (
              <TooltipHover content="View Executive Analytics">
                <Link
                  to={`/admin/consultations/${_id}/analytics`}
                  className="interactive-btn p-3 rounded-xl border border-brown-200 text-brown-700 hover:bg-brown-100"
                >
                  <BarChart3 className="w-5 h-5" />
                </Link>
              </TooltipHover>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="interactive-card bg-white/95 backdrop-blur-xs rounded-2xl border border-brown-200 p-6 flex flex-col justify-between group relative overflow-hidden shadow-xs hover:border-brown-400"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold via-brown-600 to-gov-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-brown-100 text-brown-800 border border-brown-200">
            {displayCategory || "Public Policy"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Title — Fully readable, generous line height, no truncation */}
        <h3 className="text-xl font-bold text-brown-950 group-hover:text-brown-700 transition-colors leading-snug pt-1">
          {displayTitle}
        </h3>

        <p className="text-sm text-brown-600 line-clamp-2 leading-relaxed">
          {displayDescription || "Participate in this official statutory consultation. Review the policy provisions and submit structured civic feedback."}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-brown-100 space-y-3.5">
        {/* Interactive Meta Stats */}
        <div className="flex items-center justify-between text-xs text-brown-500">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-brown-400" />
            <span className="font-bold text-brown-900">
              <AnimatedCounter value={responseCount} />
            </span>
            <span>{t("spotlight_responses")}</span>
          </div>

          <TooltipHover content={`${questions.length} consultative questions designed to gather structured feedback`}>
            <div className="flex items-center space-x-1.5 cursor-help text-brown-500 hover:text-brown-800 transition-colors">
              <FileText className="w-3.5 h-3.5 text-brown-400" />
              <span>{questions.length} {t("spotlight_questions")}</span>
            </div>
          </TooltipHover>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/consultations/${_id}`}
            className="flex-1 interactive-btn inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 text-sm font-semibold shadow-xs"
          >
            <span>{status === "closed" ? t("card_review_concluded") : t("card_review_cta")}</span>
            <ArrowRight className="w-4 h-4 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {isAdmin && (
            <TooltipHover content="Executive Analytics">
              <Link
                to={`/admin/consultations/${_id}/analytics`}
                className="interactive-btn p-2.5 rounded-xl border border-brown-200 text-brown-700 hover:text-brown-900 hover:border-brown-400 hover:bg-brown-100"
                aria-label="View Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </Link>
            </TooltipHover>
          )}
        </div>
      </div>
    </motion.div>
  );
}

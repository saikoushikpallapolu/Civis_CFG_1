import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { consultationApi } from "../api/consultationApi";
import { responseApi } from "../api/responseApi";
import DynamicForm from "../components/citizen/DynamicForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AnimatedPage from "../components/common/AnimatedPage";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();

  const [consultation, setConsultation] = useState(null);
  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [expandBriefing, setExpandBriefing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    consultationApi
      .getConsultationById(id)
      .then((res) => {
        const item = res.data?.consultation || res.data;
        setConsultation(item);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load policy consultation"
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Translate consultation dynamically when language changes (if not English)
  const fetchTranslation = useCallback(async (langCode) => {
    if (!id || langCode === "en") {
      setTranslatedData(null);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await consultationApi.translateConsultation(id, langCode);
      if (res.data) {
        setTranslatedData(res.data);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  }, [id]);

  useEffect(() => {
    if (consultation) {
      if (currentLanguage !== "en") {
        fetchTranslation(currentLanguage);
      } else {
        setTranslatedData(null);
      }
    }
  }, [currentLanguage, consultation, fetchTranslation]);

  const handleFormSubmit = async (answers) => {
    setIsSubmitting(true);
    setError("");

    try {
      await responseApi.submitResponse(id, answers);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit response. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={t("loading")} />;
  }

  if (error || !consultation) {
    return (
      <AnimatedPage className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-gov-red flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-brown-900 font-serif">
          {error || "Consultation not found"}
        </h2>
        <Link
          to="/consultations"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-accent-gold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("detail_back")}</span>
        </Link>
      </AnimatedPage>
    );
  }

  // Active content: translated if available, otherwise original
  const activeTitle = translatedData?.title || consultation.title;
  const activeDescription = translatedData?.description || consultation.description;
  const activeCategory = translatedData?.category || consultation.category;
  const activeQuestions = translatedData?.questions || consultation.questions || [];

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* Back button & quick link */}
      <div className="flex items-center justify-between">
        <Link
          to="/consultations"
          className="interactive-btn inline-flex items-center space-x-1.5 text-xs font-bold text-brown-600 hover:text-brown-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("detail_back")}</span>
        </Link>

        {isTranslating && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{t("translating_status")}</span>
          </span>
        )}
      </div>

      {/* Streamlined Policy Overview Card (Sweet-spot compact height) */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-brown-200 p-4 sm:p-5 shadow-2xs space-y-3">
        {/* Top Meta Bar: Category, Date, and In-Place Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brown-100 text-brown-800 border border-brown-200">
              {activeCategory || "Public Policy"}
            </span>
            <span className="text-xs text-brown-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brown-400" />
              <span>{t("detail_gazetted")} {new Date(consultation.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          {/* Overview Box Language Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-brown-50 p-1 rounded-xl border border-brown-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-accent-gold ml-1.5 shrink-0" />
            <span className="text-[11px] font-bold text-brown-500 mr-1 hidden sm:inline">
              {t("translate_box_title")}
            </span>
            <div className="flex items-center gap-1">
              {supportedLanguages.map((lang) => {
                const isActive = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-brown-900 text-white shadow-2xs"
                        : "text-brown-700 hover:bg-brown-200/60"
                    }`}
                  >
                    {lang.native}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Title — Prominent, crystal clear */}
        <h1 className="text-xl sm:text-2xl font-bold text-brown-950 font-serif leading-snug">
          {activeTitle}
        </h1>

        {/* Expandable Briefing Summary (compact 2-line preview prevents pushing question off-screen) */}
        <div className="text-xs sm:text-sm text-brown-700 leading-relaxed bg-brown-50/70 p-3.5 rounded-xl border border-brown-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-brown-500">
              {t("detail_statement_intent")}
            </span>
            <button
              type="button"
              onClick={() => setExpandBriefing(!expandBriefing)}
              className="interactive-btn text-xs font-bold text-brown-800 hover:text-brown-950 flex items-center gap-1"
            >
              <span>{expandBriefing ? "Collapse Briefing" : "Read Full Intent"}</span>
              {expandBriefing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <p className={expandBriefing ? "" : "line-clamp-2"}>
            {activeDescription}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission State vs Form */}
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white/95 rounded-3xl border border-emerald-300 p-8 sm:p-12 text-center shadow-xs space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-gov-teal flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-brown-950 font-serif">
            {t("form_success_title")}
          </h2>
          <p className="text-sm text-brown-600 max-w-md mx-auto leading-relaxed">
            {t("form_success_desc")}
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/consultations"
              className="interactive-btn px-6 py-2.5 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 font-semibold text-sm transition-all"
            >
              {t("form_browse_other")}
            </Link>

            {isAdmin && (
              <Link
                to={`/admin/consultations/${id}/analytics`}
                className="interactive-btn px-6 py-2.5 rounded-xl bg-gov-teal hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs"
              >
                {t("detail_executive_analytics")}
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <DynamicForm
            questions={activeQuestions}
            originalQuestions={consultation.questions || []}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            isAuthenticated={isAuthenticated}
            currentLanguage={currentLanguage}
          />
        </div>
      )}
    </AnimatedPage>
  );
}

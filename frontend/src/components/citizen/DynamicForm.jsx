import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, Check, ShieldCheck, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function DynamicForm({
  questions = [],
  originalQuestions = [],
  onSubmit,
  isSubmitting = false,
  isAuthenticated = false,
  currentLanguage = "en",
}) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [showOriginal, setShowOriginal] = useState({});

  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState("step"); // "step" | "all"

  const toggleOriginal = (qId) => {
    setShowOriginal((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSingleChoice = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleMultiChoice = (questionId, option) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  // Calculate completion progress
  const totalQuestions = questions.length;
  const isQuestionAnswered = (q) => {
    const val = answers[q.questionId];
    if (val === undefined || val === null || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const validateQuestion = (q) => {
    if (!q.required) return true;
    const val = answers[q.questionId];
    if (val === undefined || val === null || val === "") {
      setErrors((prev) => ({ ...prev, [q.questionId]: "This inquiry requires your feedback." }));
      return false;
    }
    if (Array.isArray(val) && val.length === 0) {
      setErrors((prev) => ({ ...prev, [q.questionId]: "Please select at least one option." }));
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    const currentQ = questions[currentStep];
    if (currentQ && !validateQuestion(currentQ)) {
      return;
    }
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.questionId];
        if (val === undefined || val === null || val === "") {
          newErrors[q.questionId] = "This inquiry requires your feedback.";
        } else if (Array.isArray(val) && val.length === 0) {
          newErrors[q.questionId] = "Please select at least one option.";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorIdx = questions.findIndex((q) => q.questionId === firstErrorKey);
      if (errorIdx !== -1 && viewMode === "step") {
        setCurrentStep(errorIdx);
      } else {
        const element = document.getElementById(`q-box-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const formattedAnswers = Object.entries(answers)
      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
      .map(([questionId, value]) => ({
        questionId,
        value,
      }));

    onSubmit(formattedAnswers);
  };

  const currentQ = questions[currentStep];
  const originalQ = originalQuestions.find((oq) => oq.questionId === currentQ?.questionId);
  const activeQ = showOriginal[currentQ?.questionId] && originalQ ? originalQ : currentQ;

  const renderQuestionInputs = (q) => {
    const orig = originalQuestions.find((oq) => oq.questionId === q?.questionId);
    const activeItem = showOriginal[q?.questionId] && orig ? orig : q;

    return (
      <div className="space-y-2.5">
        {/* Render Question Inputs */}
        {activeItem.type === "single_choice" && (
          <div className="space-y-2">
            {(activeItem.options || []).map((opt) => {
              const isChecked = answers[q.questionId] === opt;
              return (
                <label
                  key={opt}
                  onClick={() => handleSingleChoice(q.questionId, opt)}
                  className={`interactive-btn flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                    isChecked
                      ? "bg-brown-100/90 border-brown-600 text-brown-950 shadow-2xs ring-1 ring-brown-400"
                      : "bg-white border-brown-200 text-brown-800 hover:bg-brown-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "border-brown-800 bg-brown-800 text-white"
                          : "border-brown-300 bg-white"
                      }`}
                    >
                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{opt}</span>
                  </div>
                  {isChecked && <Check className="w-4 h-4 text-brown-800" />}
                </label>
              );
            })}
          </div>
        )}

        {activeItem.type === "multi_choice" && (
          <div className="space-y-2">
            {(activeItem.options || []).map((opt) => {
              const currentArr = Array.isArray(answers[q.questionId])
                ? answers[q.questionId]
                : [];
              const isChecked = currentArr.includes(opt);
              return (
                <label
                  key={opt}
                  onClick={() => handleMultiChoice(q.questionId, opt)}
                  className={`interactive-btn flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                    isChecked
                      ? "bg-brown-100/90 border-brown-600 text-brown-950 shadow-2xs ring-1 ring-brown-400"
                      : "bg-white border-brown-200 text-brown-800 hover:bg-brown-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "border-brown-800 bg-brown-800 text-white"
                          : "border-brown-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{opt}</span>
                  </div>
                  {isChecked && (
                    <span className="text-[10px] font-semibold text-brown-800 bg-brown-200/80 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {activeItem.type === "text" && (
          <div className="space-y-1.5">
            <textarea
              rows={3}
              value={answers[q.questionId] || ""}
              onChange={(e) => handleTextChange(q.questionId, e.target.value)}
              placeholder={t("form_written_placeholder")}
              className="w-full p-3 rounded-xl border border-brown-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brown-500/40 focus:border-brown-600 bg-brown-50/30 text-brown-950 placeholder-brown-400 transition-all shadow-inner"
            />
            <div className="flex justify-between items-center text-xs text-brown-500 px-1">
              <span>{t("form_plain_welcomed")}</span>
              <span className="font-mono text-[11px]">{(answers[q.questionId] || "").length} chars</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header Bar: Progress & Mode Switcher (Sweet-spot compact) */}
      <div className="bg-white/95 backdrop-blur-xs border border-brown-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brown-950 text-xs sm:text-sm">{t("form_progress")}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brown-100 text-brown-800">
              {answeredCount} {t("of_indicator")} {totalQuestions} {t("form_completed")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-brown-100 p-0.5 border border-brown-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("step")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === "step"
                    ? "bg-white text-brown-950 shadow-2xs font-bold"
                    : "text-brown-600 hover:text-brown-900"
                }`}
              >
                {t("form_step_calm")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === "all"
                    ? "bg-white text-brown-950 shadow-2xs font-bold"
                    : "text-brown-600 hover:text-brown-900"
                }`}
              >
                {t("form_view_all")}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-brown-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-gold via-brown-600 to-gov-teal rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Navigation Jump Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brown-400 mr-1">
            {t("form_jump_to")}
          </span>
          {questions.map((q, idx) => {
            const answered = isQuestionAnswered(q);
            const isCurrent = viewMode === "step" && currentStep === idx;
            const hasErr = !!errors[q.questionId];

            return (
              <button
                key={q.questionId || idx}
                type="button"
                onClick={() => {
                  if (viewMode === "step") {
                    setCurrentStep(idx);
                  } else {
                    const el = document.getElementById(`q-box-${q.questionId}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className={`interactive-btn flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                  isCurrent
                    ? "bg-brown-900 text-white border-brown-900 shadow-2xs ring-1 ring-brown-400"
                    : hasErr
                    ? "bg-rose-50 text-gov-red border-rose-300"
                    : answered
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    : "bg-white text-brown-700 border-brown-200 hover:bg-brown-50"
                }`}
              >
                <span>Q{idx + 1}</span>
                {answered && !isCurrent && <Check className="w-3 h-3 ml-1 text-gov-teal" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP-BY-STEP MODE (Fits on screen without scrolling) */}
      {viewMode === "step" && currentQ && (
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-brown-300/80 p-4 sm:p-5 shadow-2xs space-y-3.5"
        >
          {/* Step Meta Badge & In-Place Translation Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-brown-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brown-700 bg-brown-100 px-2.5 py-0.5 rounded-full border border-brown-200">
                {t("form_inquiry_badge")} {currentStep + 1} {t("of_indicator")} {totalQuestions}
              </span>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brown-50 text-brown-600 border border-brown-200">
                {currentQ.type === "single_choice"
                  ? t("form_select_one")
                  : currentQ.type === "multi_choice"
                  ? t("form_select_multi")
                  : t("form_written_resp")}
              </span>
            </div>

            {/* Per-Question Translation Toggle Button */}
            {currentLanguage !== "en" && originalQ && (
              <button
                type="button"
                onClick={() => toggleOriginal(currentQ.questionId)}
                className="interactive-btn inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-brown-200 bg-brown-50 hover:bg-brown-100 text-xs font-semibold text-brown-700 transition-colors"
                title="Toggle between English and Regional language for this question"
              >
                <Globe className="w-3 h-3 text-accent-gold" />
                <span>
                  {showOriginal[currentQ.questionId] ? t("show_translated") : t("show_original")}
                </span>
              </button>
            )}
          </div>

          {/* Question Prompt */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-brown-950 font-serif leading-snug">
              {activeQ.text}
              {currentQ.required && (
                <span className="text-gov-red ml-1 font-normal text-sm" title="Mandatory inquiry">*</span>
              )}
            </h2>
          </div>

          {/* Error Prompt */}
          <AnimatePresence>
            {errors[currentQ.questionId] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center text-xs font-medium text-gov-red bg-rose-50 p-2.5 rounded-xl border border-rose-200"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{errors[currentQ.questionId]}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Active Question Inputs */}
          {renderQuestionInputs(currentQ)}

          {/* Stepper Navigation Buttons (Compact & always visible) */}
          <div className="pt-3 border-t border-brown-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="interactive-btn px-4 py-2 rounded-xl border border-brown-300 text-brown-800 hover:bg-brown-100 disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm font-bold transition-all"
            >
              {t("form_btn_prev")}
            </button>

            {currentStep < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="interactive-btn px-5 py-2 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 text-xs sm:text-sm font-bold shadow-2xs transition-all"
              >
                {t("form_btn_next")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="interactive-btn px-6 py-2 rounded-xl bg-gov-teal hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all"
              >
                {isSubmitting ? t("form_transmitting") : t("form_btn_submit")}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ALL QUESTIONS MODE */}
      {viewMode === "all" && (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const hasError = !!errors[q.questionId];
            const orig = originalQuestions.find((oq) => oq.questionId === q.questionId);
            const activeItem = showOriginal[q.questionId] && orig ? orig : q;

            return (
              <motion.div
                key={q.questionId || idx}
                id={`q-box-${q.questionId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={`p-4 sm:p-5 bg-white rounded-2xl border transition-all ${
                  hasError
                    ? "border-gov-red ring-2 ring-gov-red/10 bg-rose-50/20"
                    : "border-brown-200/90 shadow-2xs hover:border-brown-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <label className="text-base font-bold text-brown-950 leading-snug font-serif">
                    <span className="text-accent-gold mr-1.5 font-mono font-normal">Q{idx + 1}.</span>
                    {activeItem.text}
                    {q.required && <span className="text-gov-red ml-1 font-normal">*</span>}
                  </label>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentLanguage !== "en" && orig && (
                      <button
                        type="button"
                        onClick={() => toggleOriginal(q.questionId)}
                        className="text-[10px] font-semibold text-accent-gold hover:underline"
                      >
                        {showOriginal[q.questionId] ? t("show_translated") : t("show_original")}
                      </button>
                    )}
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brown-100 text-brown-700 border border-brown-200">
                      {q.type === "single_choice"
                        ? t("form_select_one")
                        : q.type === "multi_choice"
                        ? t("form_select_multi")
                        : t("form_written_resp")}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center text-xs font-medium text-gov-red mb-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {errors[q.questionId]}
                    </motion.p>
                  )}
                </AnimatePresence>

                {renderQuestionInputs(q)}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Statutory Submission Footer */}
      <div className="p-4 bg-brown-950 text-brown-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-brown-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brown-800 border border-brown-700/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-gov-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-brown-50">{t("form_statutory_badge")}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brown-800 text-amber-200 border border-brown-700">
                {isAuthenticated ? t("form_verified_citizen") : t("form_anonymous")}
              </span>
            </div>
            <p className="text-[11px] text-brown-300">
              {t("form_transmission_sub")}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-brown-600 hover:bg-brown-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm border border-brown-500/40"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("form_transmitting")}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-amber-200" />
              <span>{t("form_submit_cta")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Sparkles, Send, CheckCircle2, ShieldCheck, Layers, Globe, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import TooltipHover from "../common/TooltipHover";
import { useLanguage } from "../../context/LanguageContext";
import { consultationApi } from "../../api/consultationApi";

export default function QuestionEditor({
  consultationData,
  onChange,
  onPublish,
  isPublishing,
}) {
  const { title, category, summary, questions = [] } = consultationData;
  const { supportedLanguages, t } = useLanguage();

  const [draftLanguage, setDraftLanguage] = useState("en");
  const [isTranslatingDraft, setIsTranslatingDraft] = useState(false);
  const [translateError, setTranslateError] = useState("");

  const updateField = (field, value) => {
    onChange({ ...consultationData, [field]: value });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...consultationData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, idx) => idx !== index);
    onChange({ ...consultationData, questions: updated });
  };

  const moveQuestion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange({ ...consultationData, questions: updated });
  };

  const addQuestion = () => {
    const newQ = {
      questionId: `q${questions.length + 1}`,
      text: "New consultation question for civic consideration",
      type: "single_choice",
      options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
      required: true,
    };
    onChange({ ...consultationData, questions: [...questions, newQ] });
  };

  const handleAutoTranslateDraft = async () => {
    if (draftLanguage === "en") return;
    setIsTranslatingDraft(true);
    setTranslateError("");
    try {
      const res = await consultationApi.translateDraft({
        title,
        description: summary,
        category,
        questions,
        targetLang: draftLanguage,
      });
      if (res.data) {
        onChange({
          ...consultationData,
          title: res.data.title || title,
          summary: res.data.description || summary,
          category: res.data.category || category,
          questions: res.data.questions || questions,
        });
      }
    } catch (err) {
      setTranslateError(err.response?.data?.message || "Failed to translate draft with AI.");
    } finally {
      setIsTranslatingDraft(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-brown-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Admin Single Language Authoring Toggle Bar */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-gold shrink-0" />
          <span className="text-xs font-bold text-brown-900">{t("admin_drafting_lang")}</span>
          <div className="inline-flex rounded-xl bg-white p-0.5 border border-brown-200 text-xs font-semibold shadow-2xs">
            {supportedLanguages.map((lang) => {
              const isActive = draftLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setDraftLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    isActive
                      ? "bg-brown-900 text-white font-bold shadow-2xs"
                      : "text-brown-700 hover:bg-brown-100/70"
                  }`}
                >
                  {lang.native}
                </button>
              );
            })}
          </div>
        </div>

        {draftLanguage !== "en" && (
          <button
            type="button"
            onClick={handleAutoTranslateDraft}
            disabled={isTranslatingDraft}
            className="interactive-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent-gold hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isTranslatingDraft
                ? t("admin_auto_translating")
                : `${t("admin_auto_translate_btn")} (${draftLanguage.toUpperCase()})`}
            </span>
          </button>
        )}
      </div>

      {translateError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{translateError}</span>
        </div>
      )}

      {/* Header section with interactive indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brown-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>AI Synthesized Questionnaire</span>
            </span>
          </div>
          <h3 className="text-xl font-bold text-brown-900 font-serif">
            Review & Refine Consultation Form
          </h3>
          <p className="text-xs text-brown-500 mt-0.5">
            Audit the drafted provisions, edit question phrasing, or add specific citizen prompts prior to public release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipHover content="Total questions prepared for citizens in this consultation">
            <span className="text-xs font-bold text-brown-700 bg-brown-100 px-3 py-1.5 rounded-xl border border-brown-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brown-500" />
              <span>{questions.length} Questions</span>
            </span>
          </TooltipHover>
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
            Statutory Title
          </label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full p-3 rounded-xl border border-brown-200 bg-white text-sm font-semibold text-brown-900 focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none"
            placeholder="Official consultation title..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
            Policy Portfolio / Category
          </label>
          <input
            type="text"
            value={category || ""}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full p-3 rounded-xl border border-brown-200 bg-white text-sm font-semibold text-brown-900 focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none"
            placeholder="e.g., Urban Infrastructure, Environmental Standards..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
            Executive Summary / Statement of Intent
          </label>
          <textarea
            rows={3}
            value={summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            className="w-full p-3 rounded-xl border border-brown-200 bg-white text-sm text-brown-800 focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none"
            placeholder="Brief contextual briefing for the public..."
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brown-900">
            Consultation Inquiries ({questions.length})
          </h4>
          <button
            type="button"
            onClick={addQuestion}
            className="interactive-btn inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-brown-200 bg-white hover:bg-brown-50 text-xs font-bold text-brown-800 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-accent-gold" />
            <span>Add Custom Question</span>
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((q, idx) => (
              <motion.div
                key={q.questionId || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="p-5 rounded-2xl border border-brown-200 bg-brown-50/40 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-7 h-7 rounded-lg bg-brown-200 text-brown-800 text-xs font-bold flex items-center justify-center shrink-0 border border-brown-300/60 font-mono">
                      {idx + 1}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      <TooltipHover content="Move Question Up">
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, -1)}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-brown-500 hover:text-brown-900 hover:bg-brown-200/70 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                          aria-label="Move Question Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </TooltipHover>
                      <TooltipHover content="Move Question Down">
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, 1)}
                          disabled={idx === questions.length - 1}
                          className="p-0.5 rounded text-brown-500 hover:text-brown-900 hover:bg-brown-200/70 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                          aria-label="Move Question Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </TooltipHover>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-brown-200 text-sm font-semibold text-brown-900 bg-white focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none"
                  />

                  <TooltipHover content="Remove Question">
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-2 text-brown-400 hover:text-gov-red hover:bg-rose-50 rounded-lg transition-colors"
                      aria-label="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TooltipHover>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium pl-10">
                  <div className="flex items-center space-x-2">
                    <span className="text-brown-500 font-semibold">Response Type:</span>
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const updated = [...questions];
                        updated[idx] = {
                          ...updated[idx],
                          type: newType,
                          options:
                            newType === "text"
                              ? []
                              : (q.options && q.options.length >= 2)
                              ? q.options
                              : ["Option 1", "Option 2"],
                        };
                        onChange({ ...consultationData, questions: updated });
                      }}
                      className="p-1.5 rounded-lg border border-brown-200 bg-white font-semibold text-brown-800 focus:outline-none"
                    >
                      <option value="single_choice">Single Choice (Radio)</option>
                      <option value="multi_choice">Multiple Choice (Checkboxes)</option>
                      <option value="text">Subjective Written Text</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                      className="w-4 h-4 text-brown-700 rounded border-brown-300"
                    />
                    <span className="text-brown-700">Mandatory response</span>
                  </label>
                </div>

                {/* Options for MCQ */}
                {(q.type === "single_choice" || q.type === "multi_choice") && (
                  <div className="pl-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brown-500">
                        Configured Options ({q.options?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                          updateQuestion(idx, "options", newOpts);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-brown-200/70 text-brown-800 text-[11px] font-bold hover:bg-brown-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-brown-200">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx] = e.target.value;
                              updateQuestion(idx, "options", newOpts);
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 p-1 text-xs text-brown-800 outline-none"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = q.options.filter((_, i) => i !== optIdx);
                                updateQuestion(idx, "options", newOpts);
                              }}
                              className="p-1 text-brown-400 hover:text-gov-red rounded"
                              title="Remove Option"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Publish button */}
      <div className="pt-6 border-t border-brown-100 flex justify-end">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="interactive-btn inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gov-teal hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all border border-emerald-800"
        >
          {isPublishing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Publishing Consultation...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Consultation Live</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

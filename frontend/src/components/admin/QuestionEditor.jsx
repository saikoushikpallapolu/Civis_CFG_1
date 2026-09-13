import React from "react";
import { Trash2, Plus, Sparkles, Send, CheckCircle2 } from "lucide-react";

export default function QuestionEditor({
  consultationData,
  onChange,
  onPublish,
  isPublishing,
}) {
  const { title, category, summary, questions = [] } = consultationData;

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

  const addQuestion = () => {
    const newQ = {
      questionId: `q${questions.length + 1}`,
      text: "New consultation question",
      type: "single_choice",
      options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
      required: true,
    };
    onChange({ ...consultationData, questions: [...questions, newQ] });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            AI Extraction Complete
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-outfit">
          Review & Customize Consultation
        </h3>
        <p className="text-xs text-slate-500">
          Fine-tune the policy title, summary, and generated survey questions before publishing.
        </p>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Policy Title
          </label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <input
            type="text"
            value={category || ""}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Executive Summary / Description
          </label>
          <textarea
            rows={3}
            value={summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Consultation Questions ({questions.length})
          </h4>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.questionId || idx}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 bg-white"
                />

                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-semibold">Type:</span>
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
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                  >
                    <option value="single_choice">Single Choice (Radio Buttons)</option>
                    <option value="multi_choice">Multiple Choice (Checkboxes)</option>
                    <option value="text">Subjective Written Text</option>
                  </select>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-slate-600">Required question</span>
                </label>
              </div>

              {/* Options for MCQ */}
              {(q.type === "single_choice" || q.type === "multi_choice") && (
                <div className="pl-9 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Answer Choices ({q.options?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                        updateQuestion(idx, "options", newOpts);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            updateQuestion(idx, "options", newOpts);
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 p-1 text-xs text-slate-700 outline-none"
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = q.options.filter((_, i) => i !== optIdx);
                              updateQuestion(idx, "options", newOpts);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
            </div>
          ))}
        </div>
      </div>

      {/* Publish button */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
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

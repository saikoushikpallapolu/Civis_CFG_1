import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function DynamicForm({
  questions = [],
  onSubmit,
  isSubmitting = false,
  isAuthenticated = false,
}) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side required validation
    const newErrors = {};
    questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.questionId];
        if (val === undefined || val === null || val === "") {
          newErrors[q.questionId] = "This question requires a response.";
        } else if (Array.isArray(val) && val.length === 0) {
          newErrors[q.questionId] = "Please select at least one option.";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`q-box-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Transform into backend expected schema: [{ questionId, value }]
    const formattedAnswers = Object.entries(answers)
      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
      .map(([questionId, value]) => ({
        questionId,
        value,
      }));

    onSubmit(formattedAnswers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q, idx) => {
        const hasError = !!errors[q.questionId];

        return (
          <div
            key={q.questionId || idx}
            id={`q-box-${q.questionId}`}
            className={`p-6 bg-white rounded-2xl border transition-all duration-200 ${
              hasError
                ? "border-rose-300 ring-2 ring-rose-100 bg-rose-50/20"
                : "border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <label className="text-base font-bold text-slate-900 leading-snug">
                <span className="text-indigo-600 mr-2 font-mono">Q{idx + 1}.</span>
                {q.text}
                {q.required && <span className="text-rose-500 ml-1 font-normal">*</span>}
              </label>

              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">
                {q.type === "single_choice"
                  ? "Single Choice"
                  : q.type === "multi_choice"
                  ? "Multiple Selection"
                  : "Written Feedback"}
              </span>
            </div>

            {/* Error prompt */}
            {hasError && (
              <p className="flex items-center text-xs font-medium text-rose-600 mb-3">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors[q.questionId]}
              </p>
            )}

            {/* Render Question Inputs */}
            {q.type === "single_choice" && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => {
                  const isChecked = answers[q.questionId] === opt;
                  return (
                    <label
                      key={opt}
                      onClick={() => handleSingleChoice(q.questionId, opt)}
                      className={`flex items-center p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.questionId}
                        value={opt}
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 mr-3"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "multi_choice" && (
              <div className="space-y-2">
                {(q.options || []).map((opt) => {
                  const currentArr = Array.isArray(answers[q.questionId])
                    ? answers[q.questionId]
                    : [];
                  const isChecked = currentArr.includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={() => handleMultiChoice(q.questionId, opt)}
                      className={`flex items-center p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mr-3"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "text" && (
              <textarea
                rows={4}
                value={answers[q.questionId] || ""}
                onChange={(e) => handleTextChange(q.questionId, e.target.value)}
                placeholder="Type your feedback, observations, or suggestions here..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
            )}
          </div>
        );
      })}

      {/* Submission Footer Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-900/10">
        <div>
          <h4 className="font-bold text-sm">Ready to make your voice heard?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAuthenticated
              ? "Submitting as verified citizen. Your responses directly inform policy modifications."
              : "Submitting anonymously. You can also sign in to track consultations."}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Response</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

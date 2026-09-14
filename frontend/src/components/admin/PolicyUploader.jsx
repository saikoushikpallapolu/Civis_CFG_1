import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function PolicyUploader({ onExtract, isExtracting }) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [file, setFile] = useState(null);
  const [policyText, setPolicyText] = useState("");
  const [error, setError] = useState("");
  const [extractionStep, setExtractionStep] = useState(0);

  // Stepper progress for extraction state
  useEffect(() => {
    if (isExtracting) {
      setExtractionStep(0);
      const timer1 = setTimeout(() => setExtractionStep(1), 1600);
      const timer2 = setTimeout(() => setExtractionStep(2), 3400);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setExtractionStep(0);
    }
  }, [isExtracting]);

  const steps = [
    "1. Parsing statutory provisions & clauses",
    "2. Identifying contentious civic impact areas",
    "3. Formulating balanced consultation questions",
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (
        !selected.name.endsWith(".pdf") &&
        !selected.name.endsWith(".txt") &&
        selected.type !== "application/pdf" &&
        selected.type !== "text/plain"
      ) {
        setError("Please upload a PDF (.pdf) or Plain Text (.txt) file.");
        setFile(null);
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "file") {
      if (!file) {
        setError("Please choose a policy file to upload.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      onExtract(formData);
    } else {
      if (!policyText.trim() || policyText.trim().length < 50) {
        setError("Please paste at least 50 characters of policy draft text.");
        return;
      }
      const formData = new FormData();
      formData.append("text", policyText);
      onExtract(formData);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-brown-200 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brown-100 border border-brown-200 flex items-center justify-center text-brown-700">
          <Sparkles className="w-5 h-5 text-accent-gold" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-brown-900 font-serif">
            Statutory Document Ingestion Studio
          </h3>
          <p className="text-xs text-brown-500">
            Submit draft bills, regulations, or municipal proposals to automatically synthesize structured questions
          </p>
        </div>
      </div>

      {/* Tabs with animated underline indicator */}
      <div className="flex items-center space-x-2 border-b border-brown-200 mb-6 relative">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === "file"
              ? "text-brown-900 font-bold"
              : "text-brown-500 hover:text-brown-800"
          }`}
        >
          <span>Upload Document (PDF / TXT)</span>
          {activeTab === "file" && (
            <motion.div
              layoutId="uploaderTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-700 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === "text"
              ? "text-brown-900 font-bold"
              : "text-brown-500 hover:text-brown-800"
          }`}
        >
          <span>Paste Draft Provisions</span>
          {activeTab === "text" && (
            <motion.div
              layoutId="uploaderTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-700 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-gov-red" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {activeTab === "file" ? (
          <div className="border-2 border-dashed border-brown-300 hover:border-brown-500 rounded-2xl p-8 text-center transition-colors bg-brown-50/40">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-brown-100 text-brown-700 border border-brown-200 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-brown-900">
                  {file ? file.name : "Select or drop policy file"}
                </span>
                <p className="text-xs text-brown-400 mt-1">
                  Supported formats: PDF (.pdf) or Plain Text (.txt) up to 10MB
                </p>
              </div>
              {file && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-gov-teal text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for AI Processing</span>
                </span>
              )}
            </label>
          </div>
        ) : (
          <div>
            <textarea
              rows={8}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="Paste gazette clauses, draft provisions, urban zoning policies, or environmental statutory text here..."
              className="w-full p-4 rounded-2xl border border-brown-200 bg-brown-50/30 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none font-mono text-brown-900 placeholder-brown-400"
            />
            <p className="text-xs text-brown-400 mt-1">
              Minimum 50 characters required for statutory analysis.
            </p>
          </div>
        )}

        {/* Extraction Stepper Progress when processing */}
        {isExtracting && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-brown-100/70 border border-brown-200 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-brown-800">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold animate-spin" />
                <span>Synthesizing Statutory Survey Form...</span>
              </span>
              <span className="font-tabular-nums text-brown-600">
                Step {extractionStep + 1} of 3
              </span>
            </div>
            <div className="space-y-1.5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    idx === extractionStep
                      ? "font-bold text-brown-900"
                      : idx < extractionStep
                      ? "text-gov-teal line-through"
                      : "text-brown-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      idx === extractionStep
                        ? "bg-accent-gold animate-ping"
                        : idx < extractionStep
                        ? "bg-gov-teal"
                        : "bg-brown-300"
                    }`}
                  />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isExtracting}
          className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-xl bg-brown-700 hover:bg-brown-800 text-brown-50 font-semibold text-sm transition-all shadow-xs disabled:opacity-50 border border-brown-800"
        >
          {isExtracting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate Consultation Form with AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

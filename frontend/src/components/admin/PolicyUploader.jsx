import React, { useState } from "react";
import { UploadCloud, FileText, Sparkles, AlertCircle } from "lucide-react";

export default function PolicyUploader({ onExtract, isExtracting }) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [file, setFile] = useState(null);
  const [policyText, setPolicyText] = useState("");
  const [error, setError] = useState("");

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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">
            AI Policy Ingestion Studio
          </h3>
          <p className="text-xs text-slate-500">
            Upload your draft policy to automatically generate objective and subjective consultation questions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "file"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Upload Document (PDF / TXT)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "text"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Paste Raw Policy Text
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {activeTab === "file" ? (
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
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
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800">
                  {file ? file.name : "Click to upload policy document"}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF (.pdf) or Plain Text (.txt) up to 10MB
                </p>
              </div>
              {file && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ready to extract</span>
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
              placeholder="Paste clauses, draft bills, urban planning initiatives, or environmental regulations here..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">
              Minimum 50 characters required for AI analysis.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isExtracting}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
        >
          {isExtracting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gemini is extracting questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Consultation Form with AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

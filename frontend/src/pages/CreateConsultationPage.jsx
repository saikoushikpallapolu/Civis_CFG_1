import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { consultationApi } from "../api/consultationApi";
import PolicyUploader from "../components/admin/PolicyUploader";
import QuestionEditor from "../components/admin/QuestionEditor";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";

export default function CreateConsultationPage() {
  const navigate = useNavigate();

  const [isExtracting, setIsExtracting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");

  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async (formData) => {
    setIsExtracting(true);
    setError("");

    try {
      const res = await consultationApi.generateQuestions(formData);
      const data = res.data;
      setExtractedData({
        title: data.title || "Untitled Public Consultation",
        category: data.category || "General Governance",
        summary: data.summary || data.description || "",
        questions: data.questions || [],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to extract questions from policy document. Please verify the file and try again."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublish = async () => {
    if (!extractedData) return;

    if (!extractedData.title.trim()) {
      setError("Policy title is required.");
      return;
    }

    if (extractedData.questions.length === 0) {
      setError("Please include at least one consultation question.");
      return;
    }

    setIsPublishing(true);
    setError("");

    try {
      const payload = {
        title: extractedData.title,
        category: extractedData.category,
        description: extractedData.summary,
        questions: extractedData.questions,
        status: "open",
      };

      const res = await consultationApi.createConsultation(payload);
      const newConsultationId =
        res.data?._id ||
        res.data?.consultation?._id ||
        res.data?.data?._id;

      if (newConsultationId) {
        navigate(`/consultations/${newConsultationId}`);
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to publish consultation. Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const startBlankForm = () => {
    setExtractedData({
      title: "New Public Consultation",
      category: "General Governance",
      summary: "Please provide your perspective and feedback on this draft policy initiative.",
      questions: [
        {
          questionId: "q1",
          text: "How strongly do you support the proposed initiative?",
          type: "single_choice",
          options: ["Strongly Support", "Support", "Neutral", "Oppose", "Strongly Oppose"],
          required: true,
        },
        {
          questionId: "q2",
          text: "What specific recommendations or improvements would you suggest?",
          type: "text",
          required: false,
        },
      ],
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/admin"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Admin Hub</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit">
            Policy Consultation Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingest policy documents with AI or build custom consultation forms from scratch.
          </p>
        </div>

        {!extractedData && (
          <button
            type="button"
            onClick={startBlankForm}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all self-start sm:self-auto shadow-xs"
          >
            <span>Or Build Custom Form from Scratch</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Ingestion Uploader */}
      {!extractedData ? (
        <PolicyUploader onExtract={handleExtract} isExtracting={isExtracting} />
      ) : (
        /* Step 2: Question Editor & Customizer */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-800">
              Consultation draft active. Add, edit, or remove questions below before publishing.
            </span>
            <button
              type="button"
              onClick={() => setExtractedData(null)}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Start over
            </button>
          </div>

          <QuestionEditor
            consultationData={extractedData}
            onChange={setExtractedData}
            onPublish={handlePublish}
            isPublishing={isPublishing}
          />
        </div>
      )}
    </div>
  );
}

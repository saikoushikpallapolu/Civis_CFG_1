import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { consultationApi } from "../api/consultationApi";
import PolicyUploader from "../components/admin/PolicyUploader";
import QuestionEditor from "../components/admin/QuestionEditor";
import AnimatedPage from "../components/common/AnimatedPage";
import { Sparkles, ArrowLeft, AlertCircle, FilePlus, RotateCcw } from "lucide-react";

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
          "Failed to extract questions from policy document. Please verify the file format and try again."
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
      title: "Statutory Public Consultation Draft",
      category: "Municipal & Environmental Policy",
      summary: "Please review the proposed regulatory modifications and submit structured feedback for lawmakers.",
      questions: [
        {
          questionId: "q1",
          text: "To what extent do you endorse the proposed statutory amendments?",
          type: "single_choice",
          options: ["Strongly Support", "Support", "Neutral", "Oppose", "Strongly Oppose"],
          required: true,
        },
        {
          questionId: "q2",
          text: "What specific clauses or provisions require revision or clarification?",
          type: "text",
          required: false,
        },
      ],
    });
  };

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/admin"
        className="interactive-btn inline-flex items-center space-x-1.5 text-xs font-bold text-brown-600 hover:text-brown-950 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Officer Hub</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brown-200">
        <div>
          {/* Animated Stepper Indicator */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brown-100 text-brown-800 border border-brown-200">
              {extractedData ? "Step 2 of 2: Form Customization" : "Step 1 of 2: Document Ingestion"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-brown-950 font-serif">
            Policy Consultation Studio
          </h1>
          <p className="text-xs text-brown-500 mt-0.5">
            Upload legislative drafts for AI extraction or configure inquiries manually
          </p>
        </div>

        {!extractedData && (
          <button
            type="button"
            onClick={startBlankForm}
            className="interactive-btn inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-brown-200 bg-white hover:bg-brown-50 text-brown-800 text-xs font-bold transition-all self-start sm:self-auto shadow-2xs"
          >
            <FilePlus className="w-4 h-4 text-brown-600" />
            <span>Configure Blank Questionnaire</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Ingestion Uploader vs Step 2: Question Editor with crossfade */}
      <AnimatePresence mode="wait">
        {!extractedData ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <PolicyUploader onExtract={handleExtract} isExtracting={isExtracting} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                <span>Consultation draft ready. Review questions below prior to publishing live.</span>
              </span>
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="interactive-btn text-xs font-bold text-brown-700 hover:text-brown-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-brown-200 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Upload Different File</span>
              </button>
            </div>

            <QuestionEditor
              consultationData={extractedData}
              onChange={setExtractedData}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}

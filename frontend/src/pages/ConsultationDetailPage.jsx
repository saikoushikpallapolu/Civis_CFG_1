import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { consultationApi } from "../api/consultationApi";
import { responseApi } from "../api/responseApi";
import DynamicForm from "../components/citizen/DynamicForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();

  const [consultation, setConsultation] = useState(null);
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
    return <LoadingSpinner text="Loading consultation draft..." />;
  }

  if (error || !consultation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || "Consultation not found"}</h2>
        <Link
          to="/consultations"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to consultations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/consultations"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Consultations</span>
      </Link>

      {/* Policy Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {consultation.category || "Public Policy"}
          </span>

          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {new Date(consultation.createdAt).toLocaleDateString()}</span>
            </span>

            {isAdmin && (
              <Link
                to={`/admin/consultations/${id}/analytics`}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Lawmaker Analytics</span>
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit leading-snug">
          {consultation.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {consultation.description}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission State vs Form */}
      {submitted ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-outfit">
            Thank you for your feedback!
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your response has been registered and will be integrated into the AI correlation intelligence analysis for lawmakers.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/consultations"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              Browse other policies
            </Link>

            {isAdmin && (
              <Link
                to={`/admin/consultations/${id}/analytics`}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                View Updated Analytics
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-outfit">
              Consultation Questions ({consultation.questions?.length || 0})
            </h2>
            <span className="text-xs text-slate-400">
              * marked fields are mandatory
            </span>
          </div>

          <DynamicForm
            questions={consultation.questions || []}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
    </div>
  );
}

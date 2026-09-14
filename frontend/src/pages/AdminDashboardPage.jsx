import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { consultationApi } from "../api/consultationApi";
import SkeletonCard from "../components/common/SkeletonCard";
import AnimatedPage from "../components/common/AnimatedPage";
import AnimatedCounter from "../components/common/AnimatedCounter";
import StatusPulse from "../components/common/StatusPulse";
import TooltipHover from "../components/common/TooltipHover";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import {
  BarChart3,
  Eye,
  Trash2,
  AlertCircle,
  Sparkles,
  Landmark,
  ShieldAlert,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { t, currentLanguage } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadConsultations = () => {
    setLoading(true);
    consultationApi
      .getAllConsultations({ lang: currentLanguage })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.consultations || [];
        setConsultations(list);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load consultations");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConsultations();
  }, [currentLanguage]);

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);

    try {
      await consultationApi.deleteConsultation(deleteModalId);
      setConsultations((prev) => prev.filter((c) => c._id !== deleteModalId));
      setDeleteModalId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete consultation");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalResponses = consultations.reduce(
    (acc, curr) => acc + (curr.responseCount || 0),
    0
  );

  // Time-aware greeting for government officers
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning, Policy Officer"
      : currentHour < 17
      ? "Good afternoon, Policy Officer"
      : "Good evening, Policy Officer";

  const targetConsultation = consultations.find((c) => c._id === deleteModalId);

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with time-aware greeting replacing static paragraph */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brown-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brown-100 text-brown-800 border border-brown-200">
              Department of Civic Consultation
            </span>
          </div>
          <h1 className="text-3xl font-bold text-brown-950 font-serif">
            {greeting}
          </h1>
          <p className="text-xs text-brown-500 mt-0.5">
            Overview of live legislative deliberations, citizen submission volumes, and AI synthesis
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <LanguageSelector />
          <Link
            to="/admin/create"
            className="interactive-btn inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 font-semibold text-sm shadow-xs border border-brown-900"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Ingest Draft Policy</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-brown-200 shadow-xs"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-brown-400">
            Active Consultations
          </span>
          <div className="text-3xl font-bold text-brown-950 font-serif mt-1">
            <AnimatedCounter value={consultations.length} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-brown-200 shadow-xs"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-brown-400">
            Total Submissions Gathered
          </span>
          <div className="text-3xl font-bold text-brown-700 font-serif mt-1">
            <AnimatedCounter value={totalResponses} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-brown-200 shadow-xs flex flex-col justify-between"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-brown-400">
            Analytical Engine
          </span>
          <div className="mt-2">
            <StatusPulse label="Gemini Engine Active" status="active" />
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Consultations Table */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-brown-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-brown-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brown-950 font-serif">
              Statutory Consultations Registry
            </h2>
            <p className="text-xs text-brown-500">
              Published and draft policies open for citizen input
            </p>
          </div>
          <span className="text-xs font-semibold text-brown-600 bg-brown-100 px-2.5 py-1 rounded-full border border-brown-200">
            {consultations.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonCard type="table" count={4} />
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <Landmark className="w-10 h-10 text-brown-300 mx-auto" />
            <h3 className="text-base font-bold text-brown-800 font-serif">
              No consultations currently recorded
            </h3>
            <p className="text-xs text-brown-400 max-w-sm mx-auto">
              Draft your first civic consultation by uploading statutory documents.
            </p>
            <Link
              to="/admin/create"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-accent-gold hover:underline pt-2"
            >
              <span>Ingest first draft policy</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brown-50/80 text-brown-600 text-[11px] uppercase tracking-wider font-bold border-b border-brown-100">
                <tr>
                  <th className="px-6 py-4">Title & Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Inquiries</th>
                  <th className="px-6 py-4">Submissions</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown-100">
                {consultations.map((c) => {
                  const displayTitle = (c.translations && c.translations[currentLanguage]?.title) || c.title;
                  const displayCategory = (c.translations && c.translations[currentLanguage]?.category) || c.category;

                  return (
                    <tr key={c._id} className="hover:bg-brown-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brown-950 font-serif">{displayTitle}</div>
                        <div className="text-xs text-brown-500 mt-0.5">
                          {displayCategory} • {t("detail_gazetted")} {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-gov-teal border border-emerald-200">
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-brown-700 font-medium text-xs">
                      {c.questions?.length || 0} questions
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-brown-900">
                      <AnimatedCounter value={c.responseCount || 0} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <TooltipHover content="Review AI qualitative synthesis & correlation">
                          <Link
                            to={`/admin/consultations/${c._id}/analytics`}
                            className="interactive-btn inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brown-100 text-brown-800 hover:bg-brown-200 text-xs font-bold transition-colors border border-brown-200"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-accent-gold" />
                            <span>Analytics</span>
                          </Link>
                        </TooltipHover>

                        <TooltipHover content="Preview Citizen Survey Form">
                          <Link
                            to={`/consultations/${c._id}`}
                            className="p-1.5 text-brown-500 hover:text-brown-900 hover:bg-brown-100 rounded-lg transition-colors"
                            aria-label="View Public Form"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </TooltipHover>

                        <TooltipHover content="Permanently Delete Consultation">
                          <button
                            onClick={() => setDeleteModalId(c._id)}
                            className="p-1.5 text-brown-400 hover:text-gov-red hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Delete Consultation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TooltipHover>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog (Replaces window.confirm()) */}
      <AnimatePresence>
        {deleteModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl border border-brown-200 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-gov-red flex items-center justify-center border border-rose-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="text-brown-400 hover:text-brown-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brown-950 font-serif">
                  Confirm Policy Deletion
                </h3>
                <p className="text-xs text-brown-600 mt-1 leading-relaxed">
                  Are you certain you wish to purge <span className="font-bold text-brown-900">"{targetConsultation?.title || "this consultation"}"</span>? This action removes all associated citizen submissions and synthesized analytics permanently.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalId(null)}
                  disabled={isDeleting}
                  className="interactive-btn px-4 py-2 rounded-xl text-xs font-semibold text-brown-700 bg-brown-100 hover:bg-brown-200 border border-brown-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="interactive-btn px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gov-red hover:bg-red-700 shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { consultationApi } from "../api/consultationApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  FilePlus2,
  BarChart3,
  Users,
  Eye,
  Trash2,
  AlertCircle,
  Vote,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConsultations = () => {
    setLoading(true);
    consultationApi
      .getAllConsultations()
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
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this consultation?")) {
      return;
    }

    try {
      await consultationApi.deleteConsultation(id);
      setConsultations((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete consultation");
    }
  };

  const totalResponses = consultations.reduce(
    (acc, curr) => acc + (curr.responseCount || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit">
            Policy Officer Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your policy consultations, inspect citizen response rates, and view AI insights
          </p>
        </div>

        <Link
          to="/admin/create"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New AI Consultation</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Consultations
          </span>
          <div className="text-3xl font-black text-slate-900 font-outfit mt-1">
            {consultations.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Responses Gathered
          </span>
          <div className="text-3xl font-black text-indigo-600 font-outfit mt-1">
            {totalResponses}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            AI Engine Status
          </span>
          <div className="text-sm font-bold text-emerald-600 mt-2 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 3.6 Flash Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Consultations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-outfit">
            Your Active Consultations
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {consultations.length} items
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your consultations..." />
        ) : consultations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Vote className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              No consultations created yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by ingesting a policy draft using the AI consultation generator.
            </p>
            <Link
              to="/admin/create"
              className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:underline pt-2"
            >
              <span>Create your first consultation</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Title & Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Responses</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.category} • Created{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-semibold text-xs">
                      {c.questions?.length || 0} items
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {c.responseCount || 0}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/consultations/${c._id}/analytics`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                          title="View Lawmaker AI Analytics"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Analytics</span>
                        </Link>

                        <Link
                          to={`/consultations/${c._id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Public Form"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Consultation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

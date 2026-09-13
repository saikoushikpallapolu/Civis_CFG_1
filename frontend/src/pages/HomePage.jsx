import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { consultationApi } from "../api/consultationApi";
import ConsultationCard from "../components/citizen/ConsultationCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  Vote,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Users,
  FileCheck2,
} from "lucide-react";

export default function HomePage() {
  const { isAdmin } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consultationApi
      .getAllConsultations({ limit: 6 })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.consultations || [];
        setConsultations(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Powered Civic Feedback & Correlation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-outfit max-w-4xl mx-auto leading-tight">
            Your Voice Shapes <span className="text-indigo-600">Public Policy</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Civis connects citizens directly with lawmakers. Review real policy drafts, submit structured feedback, and empower policymakers with AI correlation intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/consultations"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
            >
              <span>Explore Consultations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin/create"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Policy Studio</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI Question Ingestion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload long policy drafts. Gemini 3.6 Flash extracts essential provisions and creates objective, survey-ready consultations in seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Accessible Citizen Participation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens submit feedback seamlessly with authenticated verification or anonymous options across municipal, urban, and environmental policies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Qualitative Correlation Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lawmakers don't just see numbers—they discover WHY citizens agree or disagree through AI segment correlation and representative quotes.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Policies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-outfit">
              Active Public Consultations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and participate in live policy consultations
            </p>
          </div>

          <Link
            to="/consultations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading active consultations..." />
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Vote className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No consultations yet</h3>
            <p className="text-xs text-slate-500">
              Check back soon or create one if you are a policy administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultations.map((c) => (
              <ConsultationCard key={c._id} consultation={c} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

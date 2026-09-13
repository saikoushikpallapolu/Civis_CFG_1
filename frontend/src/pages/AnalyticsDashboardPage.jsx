import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { analyticsApi } from "../api/analyticsApi";
import ExecutiveSummaryCard from "../components/analytics/ExecutiveSummaryCard";
import SentimentDonutChart from "../components/analytics/SentimentDonutChart";
import ThemeBarChart from "../components/analytics/ThemeBarChart";
import CorrelationStackedChart from "../components/analytics/CorrelationStackedChart";
import ObjectiveChartCard from "../components/analytics/ObjectiveChartCard";
import ActionableInsightsList from "../components/analytics/ActionableInsightsList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  BarChart3,
  Calendar,
  Vote,
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const { id } = useParams();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = () => {
    setLoading(true);
    setError("");

    analyticsApi
      .getAnalytics(id)
      .then((res) => {
        setAnalyticsData(res.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load consultation analytics"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await analyticsApi.regenerateAnalytics(id);
      setAnalyticsData(res.data);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to regenerate AI analysis. Ensure responses exist."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing survey analytics & AI correlation..." />;
  }

  if (error && !analyticsData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Hub</span>
        </Link>
      </div>
    );
  }

  const {
    consultation = {},
    totalResponses = 0,
    visualizations = {},
    analysis = {},
    isCached = false,
  } = analyticsData || {};

  // If no responses yet
  if (totalResponses === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin Hub</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <Vote className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">
            Awaiting Citizen Responses
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No citizens have submitted feedback for{" "}
            <strong>"{consultation.title}"</strong> yet. The AI correlation engine
            will synthesize insights as soon as responses start coming in.
          </p>
          <div className="pt-2">
            <Link
              to={`/consultations/${consultation._id}`}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
            >
              <span>Submit a Test Citizen Response</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Policy Title */}
      <div className="space-y-3">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin Hub</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {consultation.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • {totalResponses} Total Citizen Submissions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit">
              {consultation.title}
            </h1>
          </div>

          <Link
            to={`/consultations/${consultation._id}`}
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors self-start sm:self-auto"
          >
            <span>View Public Consultation</span>
          </Link>
        </div>
      </div>

      {/* 1. AI Executive Summary Card */}
      <ExecutiveSummaryCard
        summary={analysis?.executiveSummary}
        generatedAt={analysis?.generatedAt}
        isCached={isCached}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />

      {/* 2. Top-Level Qualitative Charts: Sentiment Donut + Key Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentDonutChart
          data={visualizations?.sentimentPieChart}
          overallSentiment={analysis?.overallSentiment}
        />
        <ThemeBarChart data={visualizations?.themeBarChart} />
      </div>

      {/* 3. Deep AI Correlation Engine (Stacked Options Sliced by Sentiment) */}
      <CorrelationStackedChart
        data={visualizations?.segmentCorrelationChart}
        segmentBreakdown={analysis?.segmentBreakdown || []}
      />

      {/* 4. Actionable Policy Recommendations List */}
      <ActionableInsightsList insights={analysis?.actionableInsights || []} />

      {/* 5. Objective Survey Distributions (MCQ Bar Charts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-outfit">
            Objective Question Distributions
          </h3>
          <span className="text-xs text-slate-500">
            Direct mathematical tally of citizen choices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(visualizations?.objectiveDistributionCharts || []).map((q) => (
            <ObjectiveChartCard key={q.questionId} question={q} />
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { analyticsApi } from "../api/analyticsApi";
import ExecutiveSummaryCard from "../components/analytics/ExecutiveSummaryCard";
import SentimentDonutChart from "../components/analytics/SentimentDonutChart";
import ThemeBarChart from "../components/analytics/ThemeBarChart";
import CorrelationStackedChart from "../components/analytics/CorrelationStackedChart";
import ObjectiveChartCard from "../components/analytics/ObjectiveChartCard";
import ActionableInsightsList from "../components/analytics/ActionableInsightsList";
import SkeletonCard from "../components/common/SkeletonCard";
import AnimatedPage from "../components/common/AnimatedPage";
import AnimatedCounter from "../components/common/AnimatedCounter";
import StatusPulse from "../components/common/StatusPulse";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  BarChart3,
  Calendar,
  Landmark,
  ExternalLink,
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
    return (
      <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-48 animate-shimmer rounded-lg" />
        <SkeletonCard type="chart" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard type="chart" />
          <SkeletonCard type="chart" />
        </div>
      </AnimatedPage>
    );
  }

  if (error && !analyticsData) {
    return (
      <AnimatedPage className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-gov-red flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-brown-900 font-serif">{error}</h2>
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-accent-gold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Officer Hub</span>
        </Link>
      </AnimatedPage>
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
      <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link
          to="/admin"
          className="interactive-btn inline-flex items-center space-x-1.5 text-xs font-bold text-brown-600 hover:text-brown-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Officer Hub</span>
        </Link>

        <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-brown-200 p-12 text-center space-y-4 shadow-xs">
          <div className="flex justify-center">
            <StatusPulse label="Awaiting Deliberation Responses" status="standby" />
          </div>
          <Landmark className="w-12 h-12 text-brown-300 mx-auto mt-2" />
          <h2 className="text-xl font-bold text-brown-950 font-serif">
            Awaiting Citizen Submissions
          </h2>
          <p className="text-sm text-brown-600 max-w-md mx-auto leading-relaxed">
            No citizen submissions have been recorded for{" "}
            <strong className="text-brown-900">"{consultation.title}"</strong> yet. The AI correlation engine
            synthesizes qualitative cohorts as soon as citizen feedback is recorded.
          </p>
          <div className="pt-3">
            <Link
              to={`/consultations/${consultation._id}`}
              className="interactive-btn inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brown-800 hover:bg-brown-900 text-brown-50 font-semibold text-sm transition-all shadow-xs border border-brown-900"
            >
              <span>Submit Test Response as Citizen</span>
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Policy Title */}
      <div className="space-y-3 pb-4 border-b border-brown-200">
        <Link
          to="/admin"
          className="interactive-btn inline-flex items-center space-x-1.5 text-xs font-bold text-brown-600 hover:text-brown-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Officer Hub</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brown-100 text-brown-800 border border-brown-200">
                {consultation.category}
              </span>
              <span className="text-xs font-semibold text-brown-500">
                • <AnimatedCounter value={totalResponses} suffix=" Citizen Submissions Recorded" />
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brown-950 font-serif">
              {consultation.title}
            </h1>
          </div>

          <Link
            to={`/consultations/${consultation._id}`}
            className="interactive-btn inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-brown-200 bg-white hover:bg-brown-50 text-xs font-bold text-brown-800 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <span>Inspect Citizen Form</span>
            <ExternalLink className="w-3 h-3" />
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
        <div className="flex items-center justify-between pb-2 border-b border-brown-100">
          <div>
            <h3 className="text-lg font-bold text-brown-950 font-serif">
              Objective Inquiry Distributions
            </h3>
            <p className="text-xs text-brown-500">
              Direct mathematical tally of citizen choices across survey questions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(visualizations?.objectiveDistributionCharts || []).map((q) => (
            <ObjectiveChartCard key={q.questionId} question={q} />
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}

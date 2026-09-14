import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { consultationApi } from "../api/consultationApi";
import ConsultationCard from "../components/citizen/ConsultationCard";
import SkeletonCard from "../components/common/SkeletonCard";
import AnimatedPage from "../components/common/AnimatedPage";
import AnimatedCounter from "../components/common/AnimatedCounter";
import StatusPulse from "../components/common/StatusPulse";
import LanguageSelector from "../components/common/LanguageSelector";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Sparkles,
  BarChart3,
  ArrowRight,
  Users,
  FileCheck2,
  Landmark,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const { isAdmin } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    consultationApi
      .getAllConsultations({ lang: currentLanguage })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.consultations || [];
        setConsultations(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentLanguage]);

  const totalSubmissions = consultations.reduce(
    (acc, curr) => acc + (curr.responseCount || 0),
    0
  );

  const categories = [
    "all",
    ...Array.from(new Set(consultations.map((c) => c.category).filter(Boolean))),
  ];

  const filteredConsultations =
    selectedCategory === "all"
      ? consultations
      : consultations.filter((c) => c.category === selectedCategory);

  // Separate spotlight featured item from remaining cards
  const spotlightItem = filteredConsultations.length > 0 ? filteredConsultations[0] : null;
  const secondaryItems = filteredConsultations.slice(1, 5); // Show only next 4 to prevent overwhelming the user

  return (
    <AnimatedPage className="space-y-12 pb-20">
      {/* Hero Section — Minimal, crisp, readable */}
      <section className="pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-brown-200/70 bg-gradient-to-b from-brown-100/40 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-brown-200 text-brown-800 text-xs font-semibold shadow-2xs">
            <StatusPulse label={t("card_open")} status="active" />
            <span className="text-brown-300">|</span>
            <span className="text-brown-600 font-medium">{t("hero_badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brown-950 tracking-tight leading-tight">
            {t("hero_title_part1")} <span className="text-accent-gold">{t("hero_title_part2")}</span>
          </h1>

          <p className="text-base sm:text-lg text-brown-600 max-w-xl mx-auto leading-relaxed">
            {t("hero_desc")}
          </p>

          {/* Dedicated Regional Language Selector Bar right on the Homepage */}
          <div className="pt-1 flex justify-center">
            <LanguageSelector variant="hero" />
          </div>

          {/* Interactive Live Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-brown-200 text-brown-800 font-semibold shadow-2xs">
              <Landmark className="w-4 h-4 text-accent-gold" />
              <AnimatedCounter value={consultations.length} suffix={` ${t("stat_deliberations")}`} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-brown-200 text-brown-800 font-semibold shadow-2xs">
              <Users className="w-4 h-4 text-gov-teal" />
              <AnimatedCounter value={totalSubmissions} suffix={` ${t("stat_submissions")}`} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-brown-200 text-brown-800 font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t("step_3_title")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Deliberations Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brown-200">
          <div>
            <h2 className="text-2xl font-bold text-brown-950">
              {t("active_inquiries_title")}
            </h2>
            <p className="text-sm text-brown-500">
              {t("active_inquiries_sub")}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`interactive-btn px-3.5 py-1.5 rounded-full font-bold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-brown-800 text-brown-50 border border-brown-800 shadow-2xs"
                    : "bg-brown-100/70 text-brown-700 hover:bg-brown-200/70 border border-brown-200"
                }`}
              >
                {cat === "all" ? t("filter_all") : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonCard count={3} />
        ) : filteredConsultations.length === 0 ? (
          <div className="bg-white/80 rounded-2xl border border-brown-200 p-12 text-center space-y-2">
            <Landmark className="w-10 h-10 text-brown-300 mx-auto" />
            <h3 className="text-base font-bold text-brown-900">
              {t("no_consultations_found")}
            </h3>
            <p className="text-sm text-brown-500">
              {t("clear_filters")}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Featured Spotlight Inquiry with huge readable title */}
            {spotlightItem && (
              <div>
                <ConsultationCard
                  consultation={spotlightItem}
                  isAdmin={isAdmin}
                  variant="spotlight"
                />
              </div>
            )}

            {/* 2. Secondary Inquiries */}
            {secondaryItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-brown-950">
                    {t("active_inquiries_title")}
                  </h3>
                  <Link
                    to="/consultations"
                    className="text-xs font-bold text-brown-700 hover:text-brown-950 flex items-center gap-1"
                  >
                    <span>{t("view_all_consultations")} ({consultations.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {secondaryItems.map((c, index) => (
                    <ConsultationCard
                      key={c._id}
                      consultation={c}
                      isAdmin={isAdmin}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View Full Registry Link */}
            <div className="text-center pt-4">
              <Link
                to="/consultations"
                className="interactive-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brown-100 hover:bg-brown-200/80 border border-brown-200 text-brown-900 text-sm font-bold shadow-2xs"
              >
                <span>{t("view_all_consultations")} ({consultations.length})</span>
                <ArrowRight className="w-4 h-4 text-brown-600" />
              </Link>
            </div>
          </div>
        )}
      </section>
    </AnimatedPage>
  );
}

import React, { useState, useEffect } from "react";
import { consultationApi } from "../api/consultationApi";
import ConsultationCard from "../components/citizen/ConsultationCard";
import FilterBar from "../components/citizen/FilterBar";
import SkeletonCard from "../components/common/SkeletonCard";
import AnimatedPage from "../components/common/AnimatedPage";
import AnimatedCounter from "../components/common/AnimatedCounter";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Landmark, FileQuestion, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";

export default function ConsultationListPage() {
  const { isAdmin } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const pageSize = 6;

  const fetchConsultations = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (currentLanguage && currentLanguage !== "en") params.lang = currentLanguage;

    consultationApi
      .getAllConsultations(params)
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.consultations || [];
        setConsultations(list);
        setCurrentPage(1);

        // Derive unique categories
        const uniqueCats = Array.from(
          new Set(list.map((c) => c.category).filter(Boolean))
        );
        if (uniqueCats.length > 0) {
          setCategories(uniqueCats);
        }
      })
      .catch((err) => console.error("Error fetching consultations:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConsultations();
  }, [category, currentLanguage]);

  const handleSearch = () => {
    fetchConsultations();
  };

  // Pagination calculation
  const totalItems = consultations.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedConsultations = consultations.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <AnimatedPage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brown-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brown-100 text-brown-800 border border-brown-200">
            {t("hero_badge")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brown-950 mt-1">
            {t("list_title")}
          </h1>
          <p className="text-sm text-brown-600 mt-1">
            {t("list_sub")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-brown-200 text-brown-900 text-xs font-bold shadow-2xs">
            <Landmark className="w-4 h-4 text-accent-gold" />
            <AnimatedCounter value={totalItems} suffix=" Inquiries" />
          </span>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-brown-100/80 p-1 rounded-xl border border-brown-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white text-brown-900 shadow-2xs"
                  : "text-brown-500 hover:text-brown-800"
              }`}
              title="Comfortable Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white text-brown-900 shadow-2xs"
                  : "text-brown-500 hover:text-brown-800"
              }`}
              title="Detailed List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onSearch={handleSearch}
      />

      {/* Consultations Results Section */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : consultations.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-brown-200 p-16 text-center space-y-3 shadow-2xs">
          <FileQuestion className="w-12 h-12 text-brown-300 mx-auto" />
          <h3 className="text-xl font-bold text-brown-900">
            No consultations found
          </h3>
          <p className="text-sm text-brown-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting the category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Tally and Page indicator */}
          <div className="flex items-center justify-between text-xs text-brown-500">
            <span>
              Showing <strong className="text-brown-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-brown-900">
                {Math.min(startIndex + pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-brown-900">{totalItems}</strong> consultations
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {/* Spacious 2-Column Grid (No overwhelming wall of cards, full readable titles) */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-4"
            }
          >
            {paginatedConsultations.map((c, index) => (
              <ConsultationCard
                key={c._id}
                consultation={c}
                isAdmin={isAdmin}
                index={index}
              />
            ))}
          </div>

          {/* Clean Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-brown-200">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="interactive-btn px-4 py-2 rounded-xl text-xs font-bold border border-brown-200 bg-white hover:bg-brown-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-brown-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("btn_prev")}</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === num
                        ? "bg-brown-800 text-brown-50 shadow-2xs"
                        : "text-brown-600 hover:bg-brown-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="interactive-btn px-4 py-2 rounded-xl text-xs font-bold border border-brown-200 bg-white hover:bg-brown-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-brown-800"
              >
                <span>{t("btn_next")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </AnimatedPage>
  );
}

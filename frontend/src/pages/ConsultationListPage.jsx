import React, { useState, useEffect } from "react";
import { consultationApi } from "../api/consultationApi";
import ConsultationCard from "../components/citizen/ConsultationCard";
import FilterBar from "../components/citizen/FilterBar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { Vote, FileQuestion } from "lucide-react";

export default function ConsultationListPage() {
  const { isAdmin } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConsultations = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    consultationApi
      .getAllConsultations(params)
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.consultations || [];
        setConsultations(list);

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
  }, [category]);

  const handleSearch = () => {
    fetchConsultations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 font-outfit">
          Public Consultations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore active draft bills, urban plans, and civic policies open for public consultation
        </p>
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

      {/* Grid of Consultations */}
      {loading ? (
        <LoadingSpinner text="Loading consultations..." />
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            No consultations found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing your category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((c) => (
            <ConsultationCard key={c._id} consultation={c} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

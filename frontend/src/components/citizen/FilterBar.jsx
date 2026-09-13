import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
  onSearch,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch && onSearch()}
            placeholder="Search consultations by title, topic, or keyword..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown & Filter Pills */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(search || category) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

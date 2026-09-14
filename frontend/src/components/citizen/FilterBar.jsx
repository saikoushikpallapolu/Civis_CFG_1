import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, Check } from "lucide-react";

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
  onSearch,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="bg-white/85 backdrop-blur-xs rounded-2xl border border-brown-200 p-4 shadow-xs mb-8">
      <div className="flex flex-col gap-3.5">
        {/* Top row: Search input & clear button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <motion.div
              animate={{ scale: isFocused ? 1.15 : 1, color: isFocused ? "hsl(20, 36%, 36%)" : "hsl(24, 25%, 55%)" }}
              transition={{ duration: 0.2 }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <Search className="w-4 h-4" />
            </motion.div>
            <input
              type="text"
              value={search}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch && onSearch()}
              placeholder="Search consultations by policy title, ministry, or topic..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brown-200 bg-brown-50/40 text-brown-900 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 text-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-700 p-0.5 rounded-full hover:bg-brown-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {(search || category) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="interactive-btn px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Category Pills (Horizontal scrollable chips replacing plain select dropdown) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-brown-400 font-medium whitespace-nowrap flex items-center gap-1 pl-1 pr-1 text-[11px] uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Topic:
          </span>

          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              category === ""
                ? "bg-brown-800 text-brown-50 shadow-xs border border-brown-800"
                : "bg-brown-100/80 text-brown-700 hover:bg-brown-200/80 border border-brown-200"
            }`}
          >
            All Policies
          </button>

          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(isSelected ? "" : cat)}
                className={`interactive-btn px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brown-800 text-brown-50 shadow-xs border border-brown-800"
                    : "bg-brown-100/80 text-brown-700 hover:bg-brown-200/80 border border-brown-200"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-amber-200" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

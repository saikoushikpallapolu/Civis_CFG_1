import React from "react";

/**
 * SkeletonCard renders warm-brown shimmering placeholder cards
 * while content is loading, keeping the layout steady and engaging.
 */
export default function SkeletonCard({ count = 3, type = "card" }) {
  const items = Array.from({ length: count });

  if (type === "table") {
    return (
      <div className="w-full bg-white/70 border border-brown-200 rounded-xl overflow-hidden p-4 space-y-3 shadow-xs">
        <div className="h-10 animate-shimmer rounded-lg w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-12 animate-shimmer rounded-lg w-full opacity-80" />
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="w-full h-80 bg-white/70 border border-brown-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
        <div className="h-6 w-1/3 animate-shimmer rounded-md" />
        <div className="flex items-end justify-between gap-4 h-48 pt-4">
          <div className="w-1/6 h-3/5 animate-shimmer rounded-t-md" />
          <div className="w-1/6 h-4/5 animate-shimmer rounded-t-md" />
          <div className="w-1/6 h-2/5 animate-shimmer rounded-t-md" />
          <div className="w-1/6 h-full animate-shimmer rounded-t-md" />
          <div className="w-1/6 h-3/4 animate-shimmer rounded-t-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-white/70 border border-brown-200 rounded-xl p-6 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 animate-shimmer rounded-full" />
            <div className="h-4 w-16 animate-shimmer rounded-full" />
          </div>
          <div className="h-6 w-3/4 animate-shimmer rounded-md" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-shimmer rounded-md" />
            <div className="h-4 w-5/6 animate-shimmer rounded-md" />
          </div>
          <div className="pt-4 border-t border-brown-100 flex justify-between items-center">
            <div className="h-4 w-20 animate-shimmer rounded-md" />
            <div className="h-8 w-24 animate-shimmer rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

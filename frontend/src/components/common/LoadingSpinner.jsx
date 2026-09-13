import React from "react";

export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
    </div>
  );
}

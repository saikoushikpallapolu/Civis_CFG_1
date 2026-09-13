import React from "react";
import { Vote, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-900 font-outfit">
              Civis Platform
            </span>
            <span className="text-xs text-slate-400">| Powered by Gemini 3.6 Flash</span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-right">
            Democratizing public policy through structured citizen consultations and AI correlation intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
}

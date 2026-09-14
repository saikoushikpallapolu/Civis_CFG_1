import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSelector({ variant = "navbar", className = "" }) {
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = supportedLanguages.find((l) => l.code === currentLanguage) || supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "hero") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-brown-200 shadow-xs ${className}`}>
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-brown-600 border-r border-brown-200 mr-1">
          <Globe className="w-3.5 h-3.5 text-accent-gold" />
          <span>Language:</span>
        </div>
        {supportedLanguages.map((lang) => {
          const isActive = lang.code === currentLanguage;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`interactive-btn px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-brown-900 text-white shadow-xs"
                  : "text-brown-700 hover:bg-brown-100/80 hover:text-brown-950"
              }`}
            >
              <span>{lang.native}</span>
              {isActive && <Check className="w-3 h-3 ml-1 inline-block" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="interactive-btn inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-brown-200 bg-white/95 hover:bg-brown-100/70 text-brown-800 text-xs font-bold transition-all shadow-2xs"
        aria-label="Select portal language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-accent-gold shrink-0" />
        <span className="tracking-tight">{activeLang.native}</span>
        <ChevronDown className={`w-3 h-3 text-brown-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-brown-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brown-400 border-b border-brown-100">
            Select Language
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                  isSelected
                    ? "bg-brown-100 text-brown-950 font-bold"
                    : "text-brown-700 hover:bg-brown-50 hover:text-brown-900"
                }`}
              >
                <div className="flex flex-col">
                  <span>{lang.native}</span>
                  <span className="text-[10px] text-brown-400 font-normal">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

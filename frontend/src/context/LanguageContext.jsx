import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../i18n/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("civis_preferred_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("civis_preferred_language", currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
    }
  };

  /**
   * Helper to translate a key with fallback to English or custom fallback
   */
  const t = (key, fallback = "") => {
    const langDict = translations[currentLanguage] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isRegional: currentLanguage !== "en",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
